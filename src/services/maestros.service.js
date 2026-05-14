import { empresasApi, tiendasApi } from "@/api/maestros.api";

export const empresaService = {
  listar: () => empresasApi.listar(),
};

export const tiendaService = {
  listar: (empresa) => tiendasApi.listar(empresa),
};