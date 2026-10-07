# 📻 Rádio Modão

> **O modão de verdade no seu celular.**

Web App responsivo e Progressive Web App (PWA) voltado para os amantes de sertanejo raiz, modas de viola e clássicos antigos. Sem necessidade de login ou cadastro, pronto para tocar no celular, no computador ou no carro via Bluetooth.

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

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse no navegador: `http://localhost:3000`

3. **Gerar a versão de produção:**
   ```bash
   npm run build
   ```

---

## 📱 Recursos Principais
- **100% Offline (PWA)**: As músicas podem ser baixadas para o armazenamento interno do celular e tocadas sem gastar internet.
- **Navegação Direta**: Apenas *Início*, *Músicas* e *Modo Estrada*.
- **Modo Estrada**: Interface simplificada com botões gigantes para viagens e uso no carro.
- **Suporte a Bluetooth**: Compatível com som do carro e caixas de som Bluetooth com controles de mídia nativos (`MediaSession API`).
