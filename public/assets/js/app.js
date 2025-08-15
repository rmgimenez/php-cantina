/**
 * Arquivo JavaScript principal da aplicação Cantina
 */

// Configurações globais
const CantinaApp = {
  config: {
    baseUrl: '',
    csrfToken: '',
    debug: false,
  },

  // Inicialização da aplicação
  init: function () {
    this.setupCSRF();
    this.setupAjax();
    this.setupComponents();
    this.setupEventListeners();
    console.log('Cantina App inicializada');
  },

  // Configurar CSRF token
  setupCSRF: function () {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      this.config.csrfToken = csrfToken.getAttribute('content');
    }
  },

  // Configurar AJAX global
  setupAjax: function () {
    // Configurações jQuery AJAX se disponível
    if (typeof $ !== 'undefined') {
      $.ajaxSetup({
        headers: {
          'X-CSRF-TOKEN': this.config.csrfToken,
        },
      });
    }
  },

  // Configurar componentes
  setupComponents: function () {
    this.setupSelect2();
    this.setupDataTables();
    this.setupDatePickers();
    this.setupMasks();
  },

  // Configurar Select2
  setupSelect2: function () {
    if (typeof $.fn.select2 !== 'undefined') {
      $('.select2').select2({
        theme: 'bootstrap-5',
        language: 'pt-BR',
        placeholder: 'Selecione...',
        allowClear: true,
      });
    }
  },

  // Configurar DataTables
  setupDataTables: function () {
    if (typeof $.fn.DataTable !== 'undefined') {
      $('.datatable').DataTable({
        language: {
          url: this.config.baseUrl + '/assets/libs/datatable/lang/pt-BR.json',
        },
        responsive: true,
        pageLength: 25,
        lengthMenu: [
          [10, 25, 50, 100],
          [10, 25, 50, 100],
        ],
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        drawCallback: function () {
          // Reaplica tooltips após redraw
          CantinaApp.setupTooltips();
        },
      });
    }
  },

  // Configurar date pickers
  setupDatePickers: function () {
    // Configuração básica para inputs de data
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      input.addEventListener('blur', function () {
        this.reportValidity();
      });
    });
  },

  // Configurar máscaras
  setupMasks: function () {
    // Máscara para CPF
    const cpfInputs = document.querySelectorAll('.mask-cpf, input[data-mask="cpf"]');
    cpfInputs.forEach((input) => {
      input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
      });
    });

    // Máscara para telefone
    const phoneInputs = document.querySelectorAll('.mask-phone, input[data-mask="phone"]');
    phoneInputs.forEach((input) => {
      input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
          value = value.replace(/(\d{2})(\d)/, '($1) $2');
          value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          value = value.replace(/(\d{2})(\d)/, '($1) $2');
          value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
      });
    });

    // Máscara para valores monetários
    const moneyInputs = document.querySelectorAll('.mask-money, input[data-mask="money"]');
    moneyInputs.forEach((input) => {
      input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2) + '';
        value = value.replace('.', ',');
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        e.target.value = 'R$ ' + value;
      });
    });
  },

  // Configurar event listeners
  setupEventListeners: function () {
    // Auto-dismiss alerts
    this.setupAutoDismissAlerts();

    // Confirmação de exclusão
    this.setupDeleteConfirmation();

    // Loading states
    this.setupLoadingStates();
  },

  // Auto-dismiss para alertas
  setupAutoDismissAlerts: function () {
    const alerts = document.querySelectorAll('.alert[data-auto-dismiss]');
    alerts.forEach((alert) => {
      const delay = parseInt(alert.getAttribute('data-auto-dismiss')) || 5000;
      setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }, delay);
    });
  },

  // Confirmação de exclusão
  setupDeleteConfirmation: function () {
    document.addEventListener('click', function (e) {
      if (e.target.matches('.btn-delete, [data-action="delete"]')) {
        e.preventDefault();
        const message =
          e.target.getAttribute('data-message') || 'Tem certeza que deseja excluir este item?';
        if (confirm(message)) {
          // Prosseguir com a ação
          const form = e.target.closest('form');
          if (form) {
            form.submit();
          } else {
            window.location.href = e.target.href;
          }
        }
      }
    });
  },

  // Estados de loading
  setupLoadingStates: function () {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (form.matches('form:not([data-no-loading])')) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';

          // Restaurar estado após 5 segundos (fallback)
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 5000);
        }
      }
    });
  },

  // Configurar tooltips
  setupTooltips: function () {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  },

  // Utilities
  utils: {
    // Formatar valor monetário
    formatMoney: function (value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    },

    // Formatar data
    formatDate: function (date) {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },

    // Formatar CPF
    formatCPF: function (cpf) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // Validar CPF
    validateCPF: function (cpf) {
      cpf = cpf.replace(/[^\d]+/g, '');
      if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

      let sum = 0;
      let remainder;

      for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      }

      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(9, 10))) return false;

      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      }

      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(10, 11))) return false;

      return true;
    },

    // Mostrar toast notification
    showToast: function (message, type = 'success') {
      // Implementação básica - pode ser expandida
      const alertClass = `alert-${type}`;
      const toast = document.createElement('div');
      toast.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
      toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
      toast.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

      document.body.appendChild(toast);

      // Auto remove após 5 segundos
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 5000);
    },
  },
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
  CantinaApp.init();
});

// Expor globalmente
window.CantinaApp = CantinaApp;
