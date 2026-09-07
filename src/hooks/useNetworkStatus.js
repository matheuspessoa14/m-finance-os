import { useEffect, useState } from "react";

function readOnlineState() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function useNetworkStatus() {
  const [online, setOnline] = useState(readOnlineState);

  useEffect(() => {
    function goOnline() {
      setOnline(true);
    }

    function goOffline() {
      setOnline(false);
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
