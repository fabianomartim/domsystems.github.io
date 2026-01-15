/**
 * Script de Correção de Logo
 * Detecta e corrige problemas de carregamento da logo
 */

(function() {
    'use strict';
    
    console.log('🔧 Iniciando correção de logo...');
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixLogo);
    } else {
        fixLogo();
    }
    
    function fixLogo() {
        // Buscar todas as imagens de logo
        const logos = document.querySelectorAll('img[src*="logo.png"]');
        
        console.log(`🔍 Encontradas ${logos.length} logos para verificar`);
        
        logos.forEach((logo, index) => {
            console.log(`📸 Logo ${index + 1}:`, logo.src);
            
            // Verificar se a imagem carregou
            if (!logo.complete || logo.naturalWidth === 0) {
                console.warn(`⚠️ Logo ${index + 1} não carregou. Aplicando fallback...`);
                applyFallback(logo);
            } else {
                console.log(`✅ Logo ${index + 1} carregou com sucesso`);
            }
            
            // Adicionar listener de erro
            logo.addEventListener('error', function() {
                console.error(`❌ Erro ao carregar logo ${index + 1}`);
                applyFallback(this);
            });
            
            // Adicionar listener de sucesso
            logo.addEventListener('load', function() {
                console.log(`✅ Logo ${index + 1} carregada com sucesso`);
            });
        });
    }
    
    function applyFallback(img) {
        // Criar fallback com as iniciais
        const fallback = document.createElement('div');
        fallback.style.cssText = `
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
        `;
        fallback.textContent = 'DS';
        fallback.title = 'DOM Systems';
        
        // Substituir imagem pelo fallback
        img.parentNode.insertBefore(fallback, img);
        img.style.display = 'none';
        
        console.log('✅ Fallback aplicado');
    }
    
    // Verificar novamente após 1 segundo
    setTimeout(() => {
        const logos = document.querySelectorAll('img[src*="logo.png"]');
        let allLoaded = true;
        
        logos.forEach((logo, index) => {
            if (!logo.complete || logo.naturalWidth === 0) {
                console.warn(`⚠️ Logo ${index + 1} ainda não carregou após 1s`);
                allLoaded = false;
            }
        });
        
        if (allLoaded) {
            console.log('✅ Todas as logos carregaram com sucesso!');
        } else {
            console.warn('⚠️ Algumas logos não carregaram. Verifique:');
            console.log('1. Caminho do arquivo: images/logo.png existe?');
            console.log('2. Servidor local rodando? (python -m http.server)');
            console.log('3. Ou publique via Publish tab');
        }
    }, 1000);
    
    console.log('✅ Script de correção de logo carregado');
})();
