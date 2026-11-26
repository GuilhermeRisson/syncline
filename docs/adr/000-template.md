# 001. Title

- Status: aceito
- Data: 26/11/2026

## Context

Dois dispositivos podem editar a mesma linha enquanto estão offline. Ao sincronizarem, precisamos de uma forma combinar as alterações, garantindo que o resultado seja idêntico em todos os dispositivos e no servidor, independentemente da ordem em que as sincronizações ocorrem.

## Decision

Cada campo mantém seu próprio HLC; no momento da mesclagem, o campo com o HLC mais recente prevalece. Uma exclusão é definitiva: uma vez que uma linha é excluída, quaisquer atualizações posteriores são ignoradas.

## Alternatives considered

- LWW em nível de linha: mais simples, porém uma alteração no campo `done` (concluído) em um dispositivo apagaria uma alteração no campo `title` (título) feita em outro.
- CRDTs (tipos de dados replicados e convergentes) por tipo de campo: permitem mesclar textos, mas são muito mais complexos do que o necessário para um aplicativo de tarefas(*to-do app*).
- Atualização prevalece sobre exclusão: evita a perda de edições, mas faz com que itens excluídos "reapareçam" inesperadamente.

## Consequences

- Edições simultâneas em campos diferentes nunca geram conflito.
- Cada campo armazena uma string HLC adicional (maior consumo de armazenamento).
- Os valores de uma linha excluída podem divergir entre os dispositivos; isso é aceitável, uma vez que linhas excluídas nunca são exibidas. Uma eventual funcionalidade de "restauração" exigiria uma reavaliação desse ponto.
