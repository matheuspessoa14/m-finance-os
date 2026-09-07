import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../config/brand";

function useCollection(uid, type) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    const ref = collection(db, "users", uid, COLLECTIONS[type]);

    return onSnapshot(
      ref,
      (snapshot) => {
        setItems(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((a, b) =>
              String(b.date || b.purchaseDate || "").localeCompare(
                String(a.date || a.purchaseDate || "")
              )
            )
        );
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error(`Erro ao carregar ${type}:`, snapshotError);
        setLoading(false);
        setError(snapshotError);
      }
    );
  }, [uid, type]);

  return { items, loading, error };
}

export function useFinanceCollections(uid) {
  const rendas = useCollection(uid, "rendas");
  const parcelas = useCollection(uid, "parcelas");
  const gastos = useCollection(uid, "gastos");
  const aportes = useCollection(uid, "aportes");

  return {
    data: {
      rendas: rendas.items,
      parcelas: parcelas.items,
      gastos: gastos.items,
      aportes: aportes.items,
    },
    loading: rendas.loading || parcelas.loading || gastos.loading || aportes.loading,
    error: rendas.error || parcelas.error || gastos.error || aportes.error,
  };
}
