declare module 'geoip-lite' {
  interface GeoData {
    range: [number, number];
    country: string;
    region: string;
    eu: '1' | '0';
    timezone: string;
    city: string;
    ll: [number, number]; // latitude, longitude
    metro: number;
    area: number;
  }

  function lookup(ip: string): GeoData | null;

  export = {
    lookup
  };
}

