import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Supabase environment variables are missing. Please check your .env file."
  );
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗");
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test connection
if (typeof window !== "undefined") {
  console.log("🔌 Supabase client initialized:", {
    url: supabaseUrl?.substring(0, 20) + "...",
    hasKey: !!supabaseKey,
  });
}

// Timeout wrapper for Supabase queries
export const withTimeout = (promise, timeoutMs = 5000) => {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("İstek zaman aşımına uğradı. Lütfen tekrar deneyin.")),
      timeoutMs
    );
  });

  // Promise.race kullanarak timeout'u uygula
  const racePromise = Promise.race([promise, timeoutPromise]);
  
  // Cleanup için promise tamamlandığında timeout'u temizle
  racePromise.then(
    () => {
      if (timeoutId) clearTimeout(timeoutId);
    },
    () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  );
  
  return racePromise;
};

// Retry wrapper for Supabase queries
export const withRetry = async (
  queryFn,
  maxRetries = 2,
  delayMs = 300, // 500'den 300'e düşürdük
  timeoutMs = 5000 // 8000'den 5000'e düşürdük - daha hızlı hata tespiti
) => {
  let lastError;
  
  // İlk önce queryFn'in bir fonksiyon olduğundan emin ol
  if (typeof queryFn !== "function") {
    throw new Error("queryFn must be a function");
  }

  // Supabase client kontrolü
  if (!supabase) {
    throw new Error("Supabase client is not initialized");
  }
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries}`);
      }
      
      const queryPromise = queryFn();
      
      // Promise kontrolü
      if (!queryPromise || typeof queryPromise.then !== "function") {
        throw new Error("queryFn must return a Promise");
      }
      
      const result = await withTimeout(queryPromise, timeoutMs);
      
      if (attempt > 0) {
        console.log(`✅ Query succeeded after ${attempt + 1} attempts`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      console.error(`❌ Query attempt ${attempt + 1} failed:`, {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      
      // Network errors ve timeout'lar için retry yap
      const shouldRetry =
        error.message?.includes("zaman aşımı") ||
        error.message?.includes("timeout") ||
        error.message?.includes("network") ||
        error.message?.includes("fetch") ||
        error.message?.includes("Failed to fetch") ||
        error.code === "PGRST116" || // PostgREST connection error
        error.code === "ECONNREFUSED" ||
        (!error.code && attempt < maxRetries - 1); // Unknown errors için son deneme hariç retry
      
      if (!shouldRetry || attempt === maxRetries - 1) {
        console.error(`❌ Query failed after ${attempt + 1} attempts, giving up`);
        throw error;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
