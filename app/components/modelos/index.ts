import type { ComponentType } from 'react';
import ModeloPolaroid from './ModeloPolaroid';
import type { ModeloProps } from './ModeloPolaroid';

// 1. Ensinamos ao TypeScript exatamente o que é o "config"
export type ConfiguracaoModelo = {
  nome: string;
  componente: ComponentType<ModeloProps>;
};

// 2. Avisamos que a nossa lista usa esse formato exato
export const modelosDisponiveis = {
  polaroid: {
    nome: 'Estilo Retrô (Polaroid)',
    componente: ModeloPolaroid,
  },
} satisfies Record<string, ConfiguracaoModelo>;

export type ModeloId = keyof typeof modelosDisponiveis;

export function isModeloDisponivel(modelo: string): modelo is ModeloId {
  return Object.hasOwn(modelosDisponiveis, modelo);
}
