"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, ShoppingBag, Star, Truck } from "lucide-react";
import { getProducts, Product } from "@/app/data";

const fetchProducts = async (query: string) => {
  try {
    const searchParams = new URLSearchParams({
      q: query,
    });
    const response = await fetch("/api/products?" + searchParams.toString());
    const body = (await response.json()) as ReturnType<typeof getProducts>;
    return body;
  } catch (error) {
    console.error("Unexpected error:", error);
    return { type: "error" as const, message: "Ocurrió un error" };
  }
};

export function TalkerMarket() {
  const [query, setQuery] = useState("");
  const [sql, setSql] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchProducts(query);
      if (data.type === "error") {
        setProducts([]);
        setSql("");
        setError(data.message);
      } else {
        setError("");
        setProducts(data.products);
        setSql(data.sql);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Talker Market</h1>
      <p className="text-center mb-6 text-muted-foreground">
        Tu asistente de compras con IA para Mercado Libre
      </p>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2" />
            ¿Qué estás buscando?
          </CardTitle>
          <CardDescription>
            Describe el producto que deseas en lenguaje natural
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ej: Necesito una computadora con al menos 8GB de RAM y 256GB de almacenamiento SSD, preferiblemente de una marca reconocida"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="mb-4"
          />
          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 h-4 w-4" />
            )}
            {loading ? "Buscando en Mercado Libre..." : "Encontrar Productos"}
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <img
                src={product.img_url}
                alt={product.title}
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <CardTitle className="line-clamp-2">{product.title}</CardTitle>
              <CardDescription>
                <span className="font-semibold">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{product.rating?.toFixed(1) ?? "Sin calificaciones"}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Marca:</span> {product.brand}
                </p>
                <p>
                  <span className="font-semibold">Procesador:</span>{" "}
                  {product.cpu}
                </p>
                <p>
                  <span className="font-semibold">Almacenamiento:</span>{" "}
                  {product.disk ? parseInt(product.disk) / 1024 : "N/A"} GB
                </p>
                <p>
                  <span className="font-semibold">RAM:</span> {product.ram? parseInt(product.ram)/1024 : "N/A"} GB
                </p>
                <p>
                  <span className="font-semibold">
                    Reputación del vendedor:
                  </span>{" "}
                  {product.seller_reputation}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
              {product.free_shipping && (
                <Badge variant="secondary" className="self-start mb-2">
                  <Truck className="w-4 h-4 mr-1" /> Envío Gratis
                </Badge>
              )}
              <Button asChild className="w-full">
                <a
                  href={product.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Mercado Libre
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!!sql.length && (
        <div className="py-4">
          <h2 className="text-xl font-semibold">Consulta generada</h2>
          <p>{sql}</p>
        </div>
      )}
      {products.length === 0 && !loading && query && (
        <p className="text-center text-muted-foreground mt-4">
          No se encontraron productos. Intenta describir tus necesidades de otra
          manera.
        </p>
      )}
      {!!error.length && (
        <p className="text-center text-muted-foreground mt-4">{error}</p>
      )}
    </div>
  );
}
