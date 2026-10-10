# 📻 Rádio Modão

> **O modão de verdade no seu celular.**

Web App responsivo e Progressive Web App (PWA) voltado para os amantes de sertanejo raiz, modas de viola e clássicos antigos. Acesso pelo e-mail da compra, sem senha, no celular, no computador ou no carro via Bluetooth.

---

## 🎵 Onde colocar as 120 Músicas

Coloque seus 120 arquivos MP3 diretamente na pasta pública:
```
public/musicas/
```

### Nomenclatura sugerida:
- `track-1.mp3`, `track-2.mp3`, ... até `track-120.mp3`

O reprodutor do **Rádio Modão** já está programado para localizar e tocar automaticamente os arquivos desta pasta!

---

## 🚀 Como Rodar o Projeto Localmente

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar apenas o frontend de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse no navegador: `http://localhost:3000`

   Para testar acesso, APIs e middleware, configure `.env` e use `vercel dev`, conforme `docs/ACESSO-E-PAGAMENTOS.md`.

3. **Gerar a versão de produção:**
   ```bash
   npm run build
   ```

---

## 📱 Recursos Principais
- **PWA com músicas baixadas**: Músicas podem ser salvas no celular; a entrada e a validação periódica de acesso exigem conexão.
- **Navegação Direta**: Apenas *Início*, *Músicas* e *Modo Estrada*.
- **Modo Estrada**: Interface simplificada com botões gigantes para viagens e uso no carro.
- **Suporte a Bluetooth**: Compatível com som do carro e caixas de som Bluetooth com controles de mídia nativos (`MediaSession API`).

## Acesso por e-mail e pagamentos

A configuração de Supabase, Vercel, Zuptos e produtos complementares está em [docs/ACESSO-E-PAGAMENTOS.md](docs/ACESSO-E-PAGAMENTOS.md).
