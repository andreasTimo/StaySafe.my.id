/**
 * StaySafe.my.id — Unified API Cloud Run Function
 * Consolidates GET /api/reports, POST /api/reports, and GET /api/reports/stats.
 */

const { getDb } = require('./db');
const { isValidCategory, isValidSubcategory } = require('./categories');

/**
 * Reverse Geocoding menggunakan API gratis OpenStreetMap Nominatim
 * dengan timeout ketat 1.5 detik agar performa API StaySafe tetap stabil.
 */
async function getAddressFromCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    // Safety timeout menggunakan AbortController bawaan Node 18+
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'StaySafe.my.id API (andreastimotius33@gmail.com)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Nominatim HTTP Error');
    const data = await res.json();
    
    const addr = data.address || {};
    const road = addr.road || addr.street || addr.pedestrian || '';
    const village = addr.village || addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
    const cityDistrict = addr.city_district || addr.county || addr.city || '';
    
    const parts = [];
    if (road) parts.push(road);
    if (village) parts.push(village);
    if (cityDistrict) parts.push(cityDistrict);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    if (data.display_name) {
      return data.display_name.split(',').slice(0, 3).join(',').trim();
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.warn('[StaySafe Geocode] Gagal melakukan reverse geocoding:', error.message || error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Memicu invalidasi cache (Purge Everything) ke CDN Cloudflare secara asinkron
 * (fire-and-forget) agar tidak memperlambat response HTTP ke pengguna.
 */
function purgeCloudflareCache() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.log('[StaySafe CDN] Cloudflare Zone ID atau API Token tidak ditemukan. Purge dilewati.');
    return;
  }

  // Hanya bersihkan cache URL API backend staysafe untuk optimasi bandwidth & rate limit Free Plan
  const targetUrls = [
    'https://api.staysafe.my.id/reports',
    'https://api.staysafe.my.id/reports/stats'
  ];

  fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files: targetUrls })
  })
  .then((res) => {
    if (!res.ok) {
      return res.json().then((err) => {
        throw new Error(JSON.stringify(err));
      });
    }
    console.log('[StaySafe CDN] Berhasil memicu invalidasi cache URL API Backend spesifik ke Cloudflare.');
  })
  .catch((err) => {
    console.error('[StaySafe CDN] Gagal memicu invalidasi cache Cloudflare:', err.message || err);
  });
}

// Handler 1: GET /reports (getReports)
async function handleGetReports(req, res) {
  try {
    const db = await getDb();
    const reportsCollection = db.collection('reports');

    const { sw_lat, sw_lng, ne_lat, ne_lng } = req.query;
    let query = {};

    if (sw_lat && sw_lng && ne_lat && ne_lng) {
      const swLat = parseFloat(sw_lat);
      const swLng = parseFloat(sw_lng);
      const neLat = parseFloat(ne_lat);
      const neLng = parseFloat(ne_lng);

      if (!isNaN(swLat) && !isNaN(swLng) && !isNaN(neLat) && !isNaN(neLng)) {
        query.location = {
          $geoWithin: {
            $box: [
              [swLng, swLat], // bottom-left [longitude, latitude]
              [neLng, neLat]  // top-right [longitude, latitude]
            ]
          }
        };
      }
    }

    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.createdAt = { $gte: thirtyDaysAgo };

    const reports = await reportsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    res.set('Cache-Control', 'public, max-age=300, must-revalidate');
    return res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Handler 2: POST /reports (postReport)
async function handlePostReport(req, res) {
  try {
    const { category, subcategory, description, latitude, longitude, turnstileToken } = req.body || {};

    // 1. Mandatory Fields Validation
    if (!category || !subcategory || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    // 1.5. Cloudflare Turnstile Server-Side Validation
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return res.status(400).json({ error: 'Verifikasi keamanan Turnstile wajib diisi.' });
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      
      try {
        const formData = new URLSearchParams();
        formData.append('secret', turnstileSecret);
        formData.append('response', turnstileToken);
        formData.append('remoteip', clientIp);

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          console.warn('[StaySafe Turnstile] Verifikasi gagal:', verifyData['error-codes']);
          return res.status(400).json({ error: 'Verifikasi keamanan Turnstile gagal. Harap coba kembali.' });
        }
        console.log('[StaySafe Turnstile] Verifikasi token sukses untuk IP:', clientIp);
      } catch (err) {
        console.error('[StaySafe Turnstile] Error saat verifikasi:', err);
        return res.status(500).json({ error: 'Gagal memverifikasi keamanan Turnstile.' });
      }
    } else {
      console.warn('[StaySafe Turnstile] Kunci rahasia Turnstile tidak terkonfigurasi. Verifikasi dilewati.');
    }

    // 2. Category & Subcategory Validation
    if (!isValidCategory(category)) {
      return res.status(400).json({ error: `Kategori '${category}' tidak valid.` });
    }

    if (!isValidSubcategory(category, subcategory)) {
      return res.status(400).json({ error: `Sub-kategori '${subcategory}' tidak sesuai untuk kategori '${category}'.` });
    }

    // 3. Description Length Validation (max 500 characters)
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Deskripsi tidak boleh kosong.' });
    }
    if (description.length > 500) {
      return res.status(400).json({ error: 'Deskripsi melebihi batas 500 karakter.' });
    }

    // 4. Geospatial Coordinate Validation (Jabodetabek bounding box check)
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Format koordinat tidak valid.' });
    }

    // Latitude check: must be in Greater Jakarta region (~ -6.5 to -5.5)
    // Longitude check: must be in Greater Jakarta region (~ 106.0 to 107.5)
    if (lat < -8.5 || lat > -5.0 || lng < 105.0 || lng > 108.5) {
      return res.status(400).json({ error: 'Lokasi harus berada di dalam area Jakarta dan sekitarnya.' });
    }

    // 5. Reverse Geocoding (Cari alamat riil berdasarkan koordinat)
    const address = await getAddressFromCoords(lat, lng);

    // 6. Database Insert
    const db = await getDb();
    const reportsCollection = db.collection('reports');

    const newReport = {
      category,
      subcategory,
      description: description.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
      },
      address,
      createdAt: new Date()
    };

    const result = await reportsCollection.insertOne(newReport);
    newReport._id = result.insertedId;

    // 7. Memicu invalidasi cache Cloudflare (Opsi A - Inline Invalidation)
    purgeCloudflareCache();

    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Handler 3: GET /reports/stats (getStats)
async function handleGetStats(req, res) {
  try {
    const db = await getDb();
    const reportsCollection = db.collection('reports');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Advanced geospatial grouping pipeline:
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $project: {
          category: 1,
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          lat: { $arrayElemAt: ['$location.coordinates', 1] }
        }
      },
      {
        $project: {
          category: 1,
          gridLng: { $round: ['$lng', 3] },
          gridLat: { $round: ['$lat', 3] }
        }
      },
      {
        $group: {
          _id: {
            lng: '$gridLng',
            lat: '$gridLat',
            category: '$category'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.lng': 1,
          '_id.lat': 1,
          count: -1
        }
      },
      {
        $group: {
          _id: {
            lng: '$_id.lng',
            lat: '$_id.lat'
          },
          categories: {
            $push: {
              category: '$_id.category',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          lng: '$_id.lng',
          lat: '$_id.lat',
          count: '$totalCount',
          category: { $arrayElemAt: ['$categories.category', 0] }
        }
      }
    ];

    const stats = await reportsCollection.aggregate(pipeline).toArray();
    res.set('Cache-Control', 'public, max-age=300, must-revalidate');
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error generating stats:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Entry point Cloud Run Function: api
exports.api = async (req, res) => {
  // CORS Headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  // Parse path and normalize
  let path = req.path || req.url.split('?')[0];
  
  // Normalize path if deployed with /api or custom rewrites
  if (path.startsWith('/api')) {
    path = path.slice(4);
  }

  // Router logic
  if (path === '/reports/stats' || path === '/reports/stats/') {
    if (req.method === 'GET') {
      return handleGetStats(req, res);
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }

  if (path === '/reports' || path === '/reports/') {
    if (req.method === 'GET') {
      return handleGetReports(req, res);
    } else if (req.method === 'POST') {
      return handlePostReport(req, res);
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }

  // Catch-all 404
  return res.status(404).json({ error: `Endpoint '${path}' [${req.method}] tidak ditemukan.` });
};
