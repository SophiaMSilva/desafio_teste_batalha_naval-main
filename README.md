# Batalha Naval — Casos de Teste em JavaScript

Implementação da lógica de uma partida de Batalha Naval em JavaScript, com tabuleiro de 10x10 e frota composta por quatro navios. O projeto contém casos de teste automatizados utilizando o executor nativo do Node.js (`node:test`).

## Como rodar

Requisito: Node.js 18 ou mais novo. Não é necessário instalar dependências.

    npm test

## Arquivos

Arquivo | Conteúdo
--- | ---
`batalha-naval.js` | Regras do jogo: criação do tabuleiro, posicionamento dos navios, ataques e verificação de vitória
`batalha-naval.test.js` | Casos de teste automatizados (CT01 a CT48), organizados em 4 grupos
`package.json` | Configurações do projeto e comando de execução dos testes

---

## Regras do jogo

### Tabuleiro

- O tabuleiro possui 10 linhas e 10 colunas, totalizando 100 células.
- Cada célula registra se contém um navio e se já foi atingida por um ataque.
- Todas as células começam vazias e não atingidas.
- As coordenadas são informadas por índices de 0 a 9: o primeiro valor representa a linha e o segundo representa a coluna.

### Frota

A partida utiliza exatamente quatro navios:

Navio | Quantidade | Casas ocupadas
--- | --- | ---
Porta-aviões | 1 | 5
Encouraçado | 1 | 4
Submarino | 1 | 3
Destroier ou Hidroavião | 1 | 2

- Cada navio deve ser posicionado uma vez

### Posicionamento dos navios

- Os navios ocupam casas consecutivas na horizontal ou na vertical
- Não é permitido posicionar navios fora dos limites do tabuleiro
- Dois navios não podem ocupar a mesma célula
- O contato entre navios é permitido, desde que não exista sobreposição
- A partida começa quando os quatro navios da frota forem posicionados
- Depois que a partida começa, não é permitido posicionar novos navios

### Ataques

- Não é permitido atacar antes de posicionar todos os navios
- Ao atacar uma célula vazia, o resultado é `agua`
- Ao atacar uma célula ocupada por um navio, o resultado é `acerto`
- Uma célula não pode ser atacada mais de uma vez
- Coordenadas fracionadas, negativas ou fora do tabuleiro são rejeitadas
- Os ataques, acertos e águas são contabilizados separadamente

### Fim da partida

- Um navio é considerado destruído quando todas as suas casas forem atingidas.
- A vitória acontece somente quando os quatro navios forem destruídos
- O resultado do último ataque informa quando a vitória foi alcançada
- Depois da vitória, novos ataques não são permitidos

---

## Casos de teste

Os testes utilizam o executor nativo do Node.js (`node:test`) e as verificações do módulo `node:assert/strict`. Cada caso prepara um jogo, executa uma operação e confere o resultado esperado. Os cenários utilizam posições controladas para que os resultados sejam reproduzíveis.

### Criação do tabuleiro

Nº | Caso | Resultado esperado
--- | --- | ---
CT01 | Tamanho padrão do tabuleiro | Tamanho igual a 10
CT02 | Criar tabuleiro | 10 linhas e 10 colunas
CT03 | Quantidade de células | Total de 100 células
CT04 | Estado inicial das células | Todas vazias e não atingidas
CT05 | Estado inicial do jogo | Status `posicionando` e contadores zerados
CT06 | Composição da frota | Quatro navios com os tamanhos exigidos

### Posicionamento dos navios

Nº | Caso | Resultado esperado
--- | --- | ---
CT07 | Posicionar porta-aviões | Navio ocupa 5 casas
CT08 | Posicionar encouraçado | Navio ocupa 4 casas
CT09 | Posicionar submarino | Navio ocupa 3 casas
CT10 | Posicionar destroier | Navio ocupa 2 casas
CT11 | Utilizar hidroavião como nome alternativo | Nome é reconhecido como destroier
CT12 | Posicionar navio na horizontal | Casas consecutivas na mesma linha
CT13 | Posicionar navio na vertical | Casas consecutivas na mesma coluna
CT14 | Posicionar navios encostados | Posicionamento aceito sem sobreposição
CT15 | Posicionar navio próximo à última coluna | Posicionamento aceito quando cabe no tabuleiro
CT16 | Posicionar navio próximo à última linha | Posicionamento aceito quando cabe no tabuleiro
CT17 | Tipo de navio desconhecido | Posicionamento rejeitado
CT18 | Tipo de navio que não seja texto | Tipo rejeitado
CT19 | Posicionar o mesmo navio mais de uma vez | Segundo posicionamento rejeitado
CT20 | Posicionar destroier e hidroavião na mesma frota | Segundo posicionamento rejeitado
CT21 | Sobreposição de navios | Posicionamento rejeitado
CT22 | Navio ultrapassa a borda direita | Posicionamento rejeitado
CT23 | Navio ultrapassa a borda inferior | Posicionamento rejeitado
CT24 | Orientação diferente de horizontal ou vertical | Orientação rejeitada
CT25 | Coordenadas fracionadas | Posicionamento rejeitado
CT26 | Coordenadas negativas | Posicionamento rejeitado
CT27 | Coordenadas fora do tabuleiro | Posicionamento rejeitado
CT28 | Posicionar os quatro navios | Partida muda para o estado `jogando`
CT29 | Frota incompleta | Partida permanece no estado `posicionando`
CT30 | Posicionar navio após completar a frota | Operação rejeitada

### Ataques e resultados

Nº | Caso | Resultado esperado
--- | --- | ---
CT31 | Atacar antes de posicionar todos os navios | Ataque rejeitado
CT32 | Atacar célula vazia | Resultado `agua`
CT33 | Atacar célula ocupada por navio | Resultado `acerto`
CT34 | Registrar célula atacada | Célula marcada como atingida
CT35 | Repetir ataque na mesma posição | Segundo ataque rejeitado
CT36 | Atacar com coordenada fracionada | Ataque rejeitado
CT37 | Atacar com coordenadas negativas | Ataque rejeitado
CT38 | Atacar fora dos limites do tabuleiro | Ataque rejeitado
CT39 | Atingir apenas parte de um navio | Navio permanece não destruído
CT40 | Atingir todas as casas de um navio | Navio identificado como destruído
CT41 | Registrar ataque na água | Não aumenta a quantidade de acertos
CT42 | Contabilizar acertos e águas | Contadores permanecem separados
CT43 | Destruir todos os navios | Partida muda para o estado `vitoria`
CT44 | Ainda existir navio não destruído | Partida permanece sem vitória
CT45 | Realizar o último ataque necessário | Resultado do ataque informa a vitória
CT46 | Atacar depois da vitória | Ataque rejeitado

### Validação do estado do jogo

Nº | Caso | Resultado esperado
--- | --- | ---
CT47 | Utilizar objeto de jogo inválido | Operações rejeitadas
CT48 | Verificar vitória durante o posicionamento | Retorna `false`

