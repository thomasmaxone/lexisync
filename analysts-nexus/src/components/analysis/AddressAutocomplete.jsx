import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";

// Add your Google Maps API key here
const GOOGLE_MAPS_API_KEY = 'AIzaSyDPQ0VJzGqTkJKjxGpMJ4ELQKu9KqS7b0k';

export default function AddressAutocomplete({ value, onChange, placeholder, className }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      initAutocomplete();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setScriptLoaded(true);
        initAutocomplete();
      });
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
      initAutocomplete();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API. Please check your API key.');
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (scriptLoaded && inputRef.current) {
      initAutocomplete();
    }
  }, [scriptLoaded]);

  function initAutocomplete() {
    if (!inputRef.current || !window.google?.maps?.places) return;

    // Clear existing autocomplete if any
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'address_components', 'geometry']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    });
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Start typing address..."}
      className={className}
      autoComplete="off"
    />
  );
}