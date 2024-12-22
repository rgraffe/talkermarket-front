import sql from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

type GeminiJson = {
  type: "success" | "error";
  data: string;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  seller_reputation: string;
  brand: string;
  cpu: string;
  disk: string;
  ram: string;
  post_url: string;
  img_url: string;
  free_shipping: boolean;
};

export async function getProducts(query: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return {
      type: "error" as const,
      message: "API de Gemini no configurada",
    };
  }

  // Generate SQL query
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const fullQuery = `
    You are a developer with knowledge of SQL for databases built with Postgres.
        
    Write a SQL query, based on the user's query, given the table 'Product' and columns:
    - id: int
    - title: varchar, the name of the product in the listing
    - price: float
    - rating: float, optional, from 0 to 5 stars, indicating the average review from buyers
    - seller_reputation: int, optional, from 0 to 5. If specified, indicates how trusted the seller is
    - brand: varchar, optional, indicates the brand of the PC
    - cpu: varchar, optional, indicates the brand and model of the CPU
    - disk: int, optional, indicates the capacity in MB of storage
    - ram: int, optional, indicates the capacity in MB of RAM
    - free_shipping: boolean, indicates if there's no additional cost for shipping the PC
    
    Reply in JSON format, with two fields:
    - data: the SQL query if it's possible, or an error message if the user made an incorrect query (for example, asking for something other than a computer)
    - type: 'success' if the user is making a correct prompt, 'error' otherwise
    
    User query: ${query}`;
  const result = await model.generateContent(fullQuery);

  // Extract response text
  let json = null;
  try {
    console.log(result.response.text());
    json = JSON.parse(
      result.response.text().replaceAll("`", "").replace("json", "")
    );
    json = json as GeminiJson;
  } catch {
    return {
      type: "error" as const,
      message: "Respuesta inválida de Gemini",
    };
  }

  // Handle errors
  if (json.type === "error") {
    return {
      type: "error" as const,
      message: json.data,
    };
  }

  // Manage dangerous queries
  if (
    json.data.toUpperCase().includes("DROP") ||
    json.data.toUpperCase().includes("TRUNCATE") ||
    json.data.toUpperCase().includes("DELETE") ||
    json.data.toUpperCase().includes("UPDATE")
  ) {
    return {
      type: "error" as const,
      message: "Operación no permitida",
    };
  }

  // Use SQL to get products
  console.log(json.data);
  const products = await sql.unsafe(json.data);
  return {
    type: "success" as const,
    sql: json.data,
    products: products as unknown as Product[],
  };
}
