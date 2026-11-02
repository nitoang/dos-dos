/* duelokit theme: small, dependency-free behavior.
   1. Mobile menu closes on Escape or an outside tap.
   2. The product page keeps the variant, price and button in step with the chosen options. */

(function () {
  'use strict';

  /* Mobile menu */
  var menu = document.querySelector('.header__menu');
  if (menu) {
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        var summary = menu.querySelector('summary');
        if (summary) summary.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  /* Variant picker */
  Array.prototype.forEach.call(document.querySelectorAll('[data-product]'), function (root) {
    var data = root.querySelector('[data-variants]');
    var idInput = root.querySelector('[data-variant-id]');
    var button = root.querySelector('[data-add-button]');
    var priceEl = root.querySelector('[data-price]');
    var groups = root.querySelectorAll('.option');
    if (!data || !idInput || !button || !groups.length) return;

    var variants;
    try {
      variants = JSON.parse(data.textContent);
    } catch (error) {
      return;
    }

    function chosenOptions() {
      return Array.prototype.map.call(groups, function (group) {
        var checked = group.querySelector('input:checked');
        return checked ? checked.value : null;
      });
    }

    function findVariant(chosen) {
      for (var i = 0; i < variants.length; i += 1) {
        var match = variants[i].options.every(function (value, index) {
          return value === chosen[index];
        });
        if (match) return variants[i];
      }
      return null;
    }

    function renderPrice(variant) {
      if (!priceEl) return;
      while (priceEl.firstChild) priceEl.removeChild(priceEl.firstChild);

      var current = document.createElement('span');
      current.className = 'price__current';
      current.textContent = variant.price;
      priceEl.appendChild(current);

      if (variant.compare) {
        var compare = document.createElement('s');
        compare.className = 'price__compare';
        compare.textContent = variant.compare;
        priceEl.appendChild(compare);
      }
      priceEl.classList.toggle('price--sale', Boolean(variant.compare));
    }

    function update() {
      var variant = findVariant(chosenOptions());

      if (!variant) {
        button.disabled = true;
        button.textContent = button.getAttribute('data-unavailable-label');
        return;
      }

      idInput.value = variant.id;
      button.disabled = !variant.available;
      button.textContent = variant.available
        ? button.getAttribute('data-add-label')
        : button.getAttribute('data-sold-out-label');
      renderPrice(variant);

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '?variant=' + variant.id);
      }
    }

    root.addEventListener('change', function (event) {
      if (event.target && event.target.closest && event.target.closest('.option')) update();
    });
  });
})();
