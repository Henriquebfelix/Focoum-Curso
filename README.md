# FocoUm — Atenção Intencional, Um Foco por Vez

> Aplicativo de produtividade minimalista e serena focado na filosofia nórdica de eliminação de ruído cognitivo. Limita o trabalho diário a no máximo três prioridades vitais e oferece cronômetro Pomodoro imersivo, revisão noturna deliberada e visão semanal com métricas em fuso horário local.

[![Deploy](https://img.shields.io/badge/Deploy-Firebase%20Hosting-0D9488?style=for-the-badge&logo=firebase)](https://app-curso-henrique-2026.web.app)
[![Vite](https://img.shields.io/badge/Build-Vite%206-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🚀 Link de Acesso em Produção

- **Aplicação no ar:** [https://app-curso-henrique-2026.web.app](https://app-curso-henrique-2026.web.app)
- **Repositório GitHub:** [https://github.com/Henriquebfelix/focoum](https://github.com/Henriquebfelix/focoum)

---

## 🌿 Filosofia do Serene Focus

1. **Quiet Computing:** O espaço em branco e as cores neutras atuam como amortecedor cognitivo para proteger a atenção do usuário.
2. **Teto de Três Prioridades:** O sistema impede sobrecarga limitando ativamente o foco diário a no máximo 3 tarefas vitais.
3. **Cronômetro Pomodoro Integrado:**
   - Modo normal com cartão de tarefa e atalhos rápidos.
   - Modo imersivo em tela cheia com atalhos de teclado (`Espaço` para pausar/retomar, `Esc` para retornar).
   - Controle compacto inferior no mobile sem estourar viewports estreitas (incluindo 320px).
4. **Revisão Noturna em 3 Etapas:**
   - Reflexão consciente sobre o dia.
   - Destino claro para tarefas não concluídas.
   - Seleção das prioridades de amanhã (limite rígido e estrito de 3 vagas).
5. **Visão Semanal e Relatórios:**
   - Gráfico de 7 dias civis no fuso horário local.
   - Distribuição percentual do tempo por projeto.
   - Média diária calculada com precisão.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, Vite 6, Tailwind CSS 3
- **Design System:** Serene Focus (Dark/Light mode com persistência local)
- **Backend / Persistência:** Cloud Firestore, Firebase Auth (Google Sign-In), Cloud Functions
- **Deploy:** Firebase Hosting

---

## 💻 Como Rodar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/Henriquebfelix/focoum.git
cd focoum
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

### 4. Executar os testes
```bash
npm test
node src/utils/keyboard-and-modal.test.js
```

### 5. Compilar para produção
```bash
npm run build
```

---

## 📄 Licença

Distribuído sob licença MIT. Desenvolvido com intenção e foco.
