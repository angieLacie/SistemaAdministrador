import { parametroApi } from "@/api/parametro.api";

export const parametroService = {
  listar: async (filtros) => {
    if (!filtros?.periodo) throw new Error("El periodo es obligatorio.");
    return await parametroApi.list(filtros);
  },
  obtener:        (id)       => parametroApi.getById(id),
  crear:          (data)     => parametroApi.create(data),
  actualizar:     (id, data) => parametroApi.update(id, data),
  cambiarEstado:  (id)       => parametroApi.toggleEstado(id),
  eliminar:       (id)       => parametroApi.remove(id),
  listarCodigos:  ()         => parametroApi.listCodigos(),
  listarPeriodos: ()         => parametroApi.listPeriodos(),
};