---
name: Serene Focus
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#00685d'
  on-tertiary: '#ffffff'
  tertiary-container: '#008376'
  on-tertiary-container: '#f4fffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.015em
  title:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

# Serene Focus — Design System FocoUm

O design system personifica clareza intencional, minimalismo nórdico e foco essencialista. Elimina distrações visuais, backlogs caóticos e gamificações ruidosas, orientando a atenção do usuário para executar uma tarefa vital por vez, com teto diário de três prioridades.

## 1. Movimento e Filosofia: Minimalismo Nórdico Aquecido
- **Quiet Computing:** Espaço em branco atua como amortecedor cognitivo para proteger a atenção.
- **Interações Táteis:** Movimentos suaves, desacelerações táteis e feedback sonoro/visual contido.
- **Redução de Cortisol:** Redução drástica de ruído visual e ausência de badges de urgência artificiais.

## 2. Paleta de Cores
Inspirada em névoa matinal, pedra silenciosa e pinho costeiro.
- **Primary (`#0D9488` / `#14B8A6`):** Teal costeiro profundo para ações primárias, timer de foco e conclusão de metas.
- **Dark Neutral (`#111827` / `#0B1120`):** Base para tipografia em modo claro e canvas escuro em modo noturno.
- **Subdued Canvas (`#F9F9FF` / `#F8F9FA`):** Fundo suave com baixíssimo contraste abrasivo.
- **Border (`#E5E7EB` / `#243048`):** Delimitações estruturais sutis sem linhas duras.

## 3. Tipografia (Plus Jakarta Sans)
- Hierarquia geométrica equilibrada entre pesos 400 (regular), 500 (medium) e 600 (semibold).
- Números tabulares (`tnum`) para timers garantindo ausência de oscilação visual.

## 4. O Card de Tarefa Vital (Signature Component)
- **Ativo:** Borda lateral sólida em Teal (`#0D9488`), sombra suave de elevação nível 2, tipografia em destaque.
- **Pendente:** Superfície neutra limpa, metadados concisos.
- **Concluído:** Texto riscado discreto em cinza neutro e fundo levemente esmaecido.
