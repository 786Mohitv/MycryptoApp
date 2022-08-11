// Search field javascript
  const searchFocus = document.getElementById('search-focus');
  const keys = [
    { keyCode: 'AltLeft', isTriggered: false },
    { keyCode: 'ControlLeft', isTriggered: false },
  ];

  window.addEventListener('keydown', (e) => {
    keys.forEach((obj) => {
      if (obj.keyCode === e.code) {
        obj.isTriggered = true;
      }
    });

    const shortcutTriggered = keys.filter((obj) => obj.isTriggered).length === keys.length;

    if (shortcutTriggered) {
      searchFocus.focus();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.forEach((obj) => {
      if (obj.keyCode === e.code) {
        obj.isTriggered = false;
      }
    });
  });

  document.querySelectorAll('.form-outline').forEach((formOutline) => {
    new mdb.Input(formOutline).init();
  });
