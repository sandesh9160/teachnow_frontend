// "use client";

// import { useState, useCallback } from "react";
// import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
// import { MapPin, Search } from "lucide-react";

// const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

// interface LocationPickerProps {
//   value?: string; // e.g. "17.4922, 78.3935"
//   onChange: (value: string) => void;
//   className?: string;
//   defaultCenter?: { lat: number, lng: number };
// }

// // Default to Hyderabad if no center is provided
// const DEFAULT_MAP_CENTER = {
//   lat: 17.3850,
//   lng: 78.4867
// };

// export function LocationPicker({ 
//   value, 
//   onChange, 
//   className = "",
//   defaultCenter = DEFAULT_MAP_CENTER 
// }: LocationPickerProps) {

//   const { isLoaded, loadError } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     libraries,
//   });

//   const [map, setMap] = useState<google.maps.Map | null>(null);

//   // Track the pin location
//   const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(() => {
//     if (value) {
//       const parts = value.split(',').map(s => parseFloat(s.trim()));
//       if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
//         return { lat: parts[0], lng: parts[1] };
//       }
//     }
//     return defaultCenter;
//   });

//   const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

//   const onLoad = useCallback(function callback(map: google.maps.Map) {
//     setMap(map);
//   }, []);

//   const onUnmount = useCallback(function callback() {
//     setMap(null);
//   }, []);

//   // Update pin and emit value on map click
//   const onMapClick = (e: google.maps.MapMouseEvent) => {
//     if (e.latLng) {
//       const lat = e.latLng.lat();
//       const lng = e.latLng.lng();
//       setMarkerPosition({ lat, lng });
//       onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
//     }
//   };

//   // Called when the autocomplete instance has loaded
//   const onLoadAutocomplete = (autocompleteInstance: google.maps.places.Autocomplete) => {
//     setAutocomplete(autocompleteInstance);
//   };

//   // Called when user selects a place from Autocomplete
//   const onPlaceChanged = () => {
//     if (autocomplete !== null) {
//       const place = autocomplete.getPlace();
//       if (place.geometry && place.geometry.location) {
//         const lat = place.geometry.location.lat();
//         const lng = place.geometry.location.lng();

//         setMarkerPosition({ lat, lng });
//         onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

//         // Pan the map to the selected place
//         map?.panTo({ lat, lng });
//         map?.setZoom(16);
//       }
//     }
//   };

//   if (loadError) {
//     return (
//       <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
//         Failed to load Google Maps. Please check your API key in .env.local
//       </div>
//     );
//   }

//   if (!isLoaded) {
//     return (
//       <div className="h-[300px] w-full animate-pulse bg-muted rounded-xl flex items-center justify-center text-sm text-muted-foreground">
//         Loading Map...
//       </div>
//     );
//   }

//   return (
//     <div className={`space-y-3 ${className}`}>
//       {/* Search Input */}
//       <div className="relative">
//         <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
//           <div className="relative">
//             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <input
//               type="text"
//               placeholder="Search for a location..."
//               className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
//               onKeyDown={(e) => {
//                 // Prevent form submission when pressing enter inside autocomplete
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                 }
//               }}
//             />
//           </div>
//         </Autocomplete>
//       </div>

//       {/* Map Interactive Area */}
//       <div className="relative h-[250px] w-full overflow-hidden rounded-xl border border-border shadow-sm">
//         <GoogleMap
//           mapContainerStyle={{ width: "100%", height: "100%" }}
//           center={markerPosition}
//           zoom={13}
//           onLoad={onLoad}
//           onUnmount={onUnmount}
//           onClick={onMapClick}
//           options={{
//             streetViewControl: false,
//             mapTypeControl: false,
//             fullscreenControl: false,
//             zoomControl: true,
//             gestureHandling: "greedy", // Allow scrolling over map without two fingers on mobile
//           }}
//         >
//           <Marker 
//             position={markerPosition} 
//             animation={window.google?.maps?.Animation?.DROP} 
//           />
//         </GoogleMap>

//         {/* Selected Coordinates Overlay */}
//         <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-sm flex items-center justify-between pointer-events-none">
//           <div className="flex items-center gap-3">
//             <div className="h-9 w-9 flex items-center justify-center bg-primary/10 rounded-md">
//               <MapPin className="h-4.5 w-4.5 text-primary" />
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-0.5">Selected Location</span>
//               <span className="text-xs text-muted-foreground">{markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { MapPin, Search, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Library = "places" | "drawing" | "geometry" | "visualization";
const libraries: Library[] = ["places"];

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

export function LocationPicker({
  lat,
  lng,
  onChange,
  className = "",
  hideControls = false,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const [position, setPosition] =
    useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);

  // Sync external value
  useEffect(() => {
    const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
    const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;
    
    if (latNum !== null && lngNum !== null && !Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
      setPosition({ lat: latNum as number, lng: lngNum as number });
    }
  }, [lat, lng]);

  const updateLocation = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    onChange(lat, lng);
    map?.panTo({ lat, lng });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocation(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(
          pos.coords.latitude,
          pos.coords.longitude
        );
        map?.setZoom(16);
      },
      () => toast.error("Please enable location access in your browser settings.")
    );
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        updateLocation(
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
        map?.setZoom(16);
      }
    }
  };

  if (loadError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border rounded-lg text-sm">
        Failed to load map. Check API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-sm">
        Loading Map...
      </div>
    );
  }

  const safePosition = (Number.isFinite(position.lat) && Number.isFinite(position.lng)) 
    ? position 
    : DEFAULT_CENTER;

  return (
    <div className={cn("space-y-2", className)}>

      {!hideControls && (
        <div className="flex flex-col sm:flex-row gap-1.5">
          {/* Search */}
          <div className="relative flex-1">
            <Autocomplete
              onLoad={(a) => setAutocomplete(a)}
              onPlaceChanged={onPlaceChanged}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search location..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </Autocomplete>
          </div>

          {/* My Location Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-xl border bg-white hover:bg-gray-100 transition"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      )}

      {/* Map */}
      <div className="relative w-full h-[350px] rounded-xl overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={safePosition}
          zoom={13}
          onClick={handleMapClick}
          onLoad={(map) => setMap(map)}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          <Marker
            position={safePosition}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                updateLocation(
                  e.latLng.lat(),
                  e.latLng.lng()
                );
              }
            }}
            animation={
              isLoaded ? google.maps.Animation.DROP : undefined
            }
          />
        </GoogleMap>

        {/* Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md border rounded-lg px-3 py-2 flex items-center gap-3 shadow text-xs">
          <MapPin className="h-4 w-4 text-blue-500" />
          <div>
            <p className="font-medium text-gray-700">
              Selected Location
            </p>
            <p className="text-gray-500">
              {(position?.lat || 0).toFixed(5)},{" "}
              {(position?.lng || 0).toFixed(5)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}