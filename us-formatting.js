/**
 * Formatação de campos US - Telefone e ZIP Code
 * Versão: 3.1.4
 */

(function() {
    'use strict';
    
    console.log('📞 Iniciando formatação US...');
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUSFormatting);
    } else {
        initUSFormatting();
    }
    
    function initUSFormatting() {
        // Formatar telefones
        const phoneFields = [
            'leadCelular',
            'leadTelefoneComercial',
            'telefone1',
            'telefone2'
        ];
        
        phoneFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', formatUSPhone);
                field.addEventListener('keypress', allowOnlyNumbers);
                console.log(`✅ Formatação US aplicada: #${fieldId}`);
            }
        });
        
        // Formatar ZIP codes
        const zipFields = [
            'leadCEP',
            'enderecoZipcode'
        ];
        
        zipFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', formatUSZipCode);
                field.addEventListener('keypress', allowOnlyNumbers);
                console.log(`✅ Formatação ZIP aplicada: #${fieldId}`);
            }
        });
        
        console.log('✅ Formatação US configurada');
    }
    
    /**
     * Formata telefone no padrão US: (555) 123-4567
     */
    function formatUSPhone(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
        
        if (value.length === 0) {
            e.target.value = '';
            return;
        }
        
        // Limitar a 10 dígitos
        value = value.substring(0, 10);
        
        // Aplicar formato
        if (value.length <= 3) {
            e.target.value = `(${value}`;
        } else if (value.length <= 6) {
            e.target.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
        } else {
            e.target.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
        }
    }
    
    /**
     * Formata ZIP code no padrão US: 12345 ou 12345-6789
     */
    function formatUSZipCode(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
        
        if (value.length === 0) {
            e.target.value = '';
            return;
        }
        
        // Limitar a 9 dígitos
        value = value.substring(0, 9);
        
        // Aplicar formato
        if (value.length <= 5) {
            e.target.value = value;
        } else {
            e.target.value = `${value.substring(0, 5)}-${value.substring(5)}`;
        }
    }
    
    /**
     * Permite apenas números e teclas de controle
     */
    function allowOnlyNumbers(e) {
        const char = String.fromCharCode(e.which);
        
        // Permitir: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        
        // Permitir apenas números
        if (!/^[0-9]$/.test(char)) {
            e.preventDefault();
        }
    }
    
    // Também formatar ao carregar valores (edição)
    window.formatUSPhoneValue = function(value) {
        if (!value) return '';
        
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        
        if (cleaned.length <= 3) {
            return `(${cleaned}`;
        } else if (cleaned.length <= 6) {
            return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
        } else {
            return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
        }
    };
    
    window.formatUSZipCodeValue = function(value) {
        if (!value) return '';
        
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        
        if (cleaned.length <= 5) {
            return cleaned;
        } else {
            return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 9)}`;
        }
    };
    
    console.log('✅ Script de formatação US carregado');
})();
