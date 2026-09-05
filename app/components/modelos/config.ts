export const idsModelos = ['polaroid', 'aventuras'] as const;

export type ModeloId = (typeof idsModelos)[number];

export function isModeloDisponivel(modelo: string): modelo is ModeloId {
  return idsModelos.some((modeloDisponivel) => modeloDisponivel === modelo);
}
