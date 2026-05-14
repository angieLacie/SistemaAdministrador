import { httpSeguridad } from "./https";

export const empresasApi = {
  listar: () => httpSeguridad.get("/api/Empresas"),
};

export const tiendasApi = {
  listar: (empresa) => {
    const q = empresa ? `?empresa=${empresa}` : "";
    return httpSeguridad.get(`/api/Tiendas${q}`);
  },
};