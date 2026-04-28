"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Search, LocateFixed, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Use the recommended "places" and "marker" libraries
const libraries: ("places" | "marker")[] = ["places", "marker"];

interface LocationPickerProps {
  lat?: number | string | null;
  lng?: number | string | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  hideControls?: boolean;
}

const DEFAULT_CENTER = {
  lat: 17.385,
  lng: 78.4867,
};

// Modern Marker implementation using AdvancedMarkerElement
function AdvancedMarker({ map, position, onDragEnd }: { map: google.maps.Map | null, position: google.maps.LatLngLiteral, onDragEnd: (lat: number, lng: number) => void }) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || markerRef.current) return;

    const initMarker = async () => {
      try {
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
        
        const marker = new AdvancedMarkerElement({
          map,
          position,
          gmpDraggable: true,
          title: "Drag to set location",
        });

        marker.addListener("dragend", () => {
          const newPos = marker.position as google.maps.LatLngLiteral;
          if (newPos) {
            onDragEnd(newPos.lat, newPos.lng);
          }
        });

        markerRef.current = marker;
      } catch (err) {
        console.error("Advanced Marker failed:", err);
      }
    };

    initMarker();

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.position = position;
    }
  }, [position]);

  return null;
}

export function LocationPicker({
  lat,
  lng,
  onChange,
  className = "",
  hideControls = false,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    version: "weekly",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [hasLocationSet, setHasLocationSet] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync external value
  useEffect(() => {
    const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
    const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;
    
    if (latNum !== null && lngNum !== null && !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
      setPosition({ lat: latNum as number, lng: lngNum as number });
      setHasLocationSet(true);
    }
  }, [lat, lng]);

  const updateLocation = useCallback((newLat: number, newLng: number) => {
    setPosition({ lat: newLat, lng: newLng });
    setHasLocationSet(true);
    onChange(newLat, newLng);
    map?.panTo({ lat: newLat, lng: newLng });
  }, [map, onChange]);

  // Modern Place Autocomplete Implementation
  useEffect(() => {
    if (!isLoaded || !map || !searchInputRef.current || hideControls) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;

    const initAutocomplete = async () => {
      try {
        const { Autocomplete } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
        
        autocomplete = new Autocomplete(searchInputRef.current!, {
          fields: ["geometry", "name", "formatted_address"],
          types: ["geocode", "establishment"]
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          if (place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            updateLocation(lat, lng);
            map.setZoom(16);
          }
        });
      } catch (err) {
        console.error("Autocomplete failed to initialize:", err);
      }
    };

    initAutocomplete();

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [isLoaded, map, hideControls, updateLocation]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && !hideControls) {
      updateLocation(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
        map?.setZoom(16);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not determine your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true }
    );
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
        <MapPin className="w-8 h-8 text-rose-400 mb-2" />
        <p className="text-sm font-semibold text-rose-800">Map Engine Error</p>
        <p className="text-[11px] text-rose-600 mt-1 max-w-[200px]">Failed to load Map. Check your Google Maps API Key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl flex flex-col items-center justify-center gap-3 border border-slate-100 shadow-inner">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Satellite Data...</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 flex flex-col h-full min-h-[300px]", className)}>
      {!hideControls && (
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Enter institution address or city..."
              className="w-full pl-10 pr-4 py-2.5 text-[13px] font-medium rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-xs"
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            />
          </div>

          {/* Current Location Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold rounded-xl border border-indigo-100 bg-white text-indigo-600 hover:bg-slate-50 transition-all shadow-xs shrink-0 active:scale-95"
          >
            <LocateFixed className="h-4 w-4" />
            <span>My Location</span>
          </button>
        </div>
      )}

      {/* Map Interactive Area */}
      <div className="relative flex-1 w-full min-h-[250px] overflow-hidden rounded-2xl border border-slate-200 shadow-inner bg-slate-50">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={position}
          zoom={13}
          onLoad={(map) => setMap(map)}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
            mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
            gestureHandling: hideControls ? "none" : "greedy",
          }}
        >
          {hasLocationSet && (
            <AdvancedMarker 
              map={map} 
              position={position} 
              onDragEnd={(lat, lng) => !hideControls && updateLocation(lat, lng)} 
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}