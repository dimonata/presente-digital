import type { ComponentType } from 'react';
import ModeloPolaroid from './ModeloPolaroid';
import ModeloAventuras from './ModeloAventuras';
import type { ModeloProps } from './ModeloPolaroid';
import type { ModeloId } from './config';

export { isModeloDisponivel, type ModeloId } from './config';

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
  aventuras: {
    nome: 'Álbum de Aventuras',
    componente: ModeloAventuras,
  },
} satisfies Record<ModeloId, ConfiguracaoModelo>;
