// Import URL dari config pusat (biar bisa baca .env)
import { API_BASE_URL } from '../../config'; 

// Utility: timeout 10 detik
function apiTimeout(ms, promise) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Request timeout")), ms);
        promise
            .then((res) => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

// Request wrapper
async function request(path, options = {}) {
    // GABUNGKAN OPTIONS DEFAULT
    const finalOptions = {
        ...options,
        // PENTING: Agar cookie Auth terbawa saat request
        credentials: 'include', 
        headers: {
            ...options.headers,
            // Header default jika belum ada
            // (kecuali upload file yg tidak butuh content-type json)
            ...(!options.body || typeof options.body === 'string' ? { "Content-Type": "application/json" } : {})
        }
    };

    try {
        const res = await apiTimeout(
            10000, 
            fetch(`${API_BASE_URL}${path}`, finalOptions)
        );

        // Handle No Content (misal delete sukses tapi gak ada body)
        if (res.status === 204) return { ok: true, status: 204, data: null };

        let result;
        try {
            result = await res.json();
        } catch {
            // Jika error parsing json, anggap error text biasa
            throw new Error(res.statusText || "Invalid JSON response");
        }

        if (!res.ok) {
            throw new Error(result.message || "API Error");
        }

        return {
            ok: true,
            status: res.status,
            data: result, // Data sukses ada di sini
        };

    } catch (err) {
        return {
            ok: false,
            status: 0,
            error: err.message, // Pesan error ada di sini
        };
    }
}

// --- EXPORT METHODS ---

export function apiGet(path) {
    return request(path, { method: 'GET' });
}

export function apiPost(path, body) {
    return request(path, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export function apiPut(path, body) {
    return request(path, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export function apiDelete(path, body) {
    return request(path, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}


// Upload File (Khusus ini jangan stringify body)
export function apiUpload(path, formData) {
    return request(path, {
        method: "POST",
        body: formData, 
        // Header Content-Type jangan di-set manual, biar browser yang atur boundary multipart
        headers: {} 
    });
}