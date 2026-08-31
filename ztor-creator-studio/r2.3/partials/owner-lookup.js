/* SiteSpecific Owner lookup for Admin IP Bank Entry.
   Inputs: sample directory + duplicate predicate. Outputs: linked user or invite email. */
(function () {
  'use strict';

  function tr(key, fallback, values) {
    var text = window.i18nT ? (window.i18nT(key) || fallback) : fallback;
    Object.keys(values || {}).forEach(function (name) { text = text.replace('{'+name+'}', values[name]); });
    return text;
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (character) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character];
    });
  }
  function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  function labelFor(user) { return user.displayName + ' · @' + user.username + ' · ' + user.email; }

  function mount(options) {
    var host = options.host;
    var directory = options.directory || [];
    var state = { kind:'empty' };
    var input, results, status;
    host.innerHTML = '<div class="owner-lookup"><input class="input" type="search" autocomplete="off" data-owner-lookup-input><div class="owner-lookup__results" data-owner-lookup-results role="listbox" hidden></div><p class="owner-lookup__status" data-owner-lookup-status role="status" hidden></p></div>';
    input = host.querySelector('[data-owner-lookup-input]');
    results = host.querySelector('[data-owner-lookup-results]');
    status = host.querySelector('[data-owner-lookup-status]');
    input.setAttribute('aria-label', tr('ipentry.owner.input-label', 'Owner search'));
    input.setAttribute('placeholder', tr('ipentry.owner.placeholder', 'Search username or email'));

    function emit() {
      var detail = state.kind === 'linked' ? { kind:'linked', user:state.user } : state.kind === 'invite' ? { kind:'invite', email:state.email } : { kind:'empty' };
      host.dispatchEvent(new CustomEvent('ownerlookup:change', { bubbles:true, detail:detail }));
      if (options.onChange) options.onChange(detail);
    }
    function setStatus(message, nextState) {
      status.textContent = message || '';
      status.dataset.state = nextState || '';
      status.hidden = !message;
    }
    function hideResults() { results.hidden = true; results.innerHTML = ''; }
    function findMatches(query) {
      var normalized = query.toLowerCase();
      return directory.filter(function (user) {
        return [user.displayName, user.username, '@'+user.username, user.email].some(function (value) { return String(value).toLowerCase().indexOf(normalized) !== -1; });
      });
    }
    function knownEmail(email) {
      return directory.some(function (user) { return user.email.toLowerCase() === email.toLowerCase(); });
    }
    function renderResults() {
      var query = input.value.trim();
      state = { kind:'empty' };
      emit();
      if (!query) { hideResults(); setStatus('', ''); return; }
      var matches = findMatches(query);
      var email = query.toLowerCase();
      var duplicate = isEmail(email) && options.isInviteDuplicate && options.isInviteDuplicate(email);
      var html = matches.map(function (user) {
        return '<button class="owner-lookup__result" type="button" role="option" data-owner-id="'+escapeHtml(user.id)+'"><span class="owner-lookup__avatar">'+escapeHtml(user.displayName.slice(0, 1))+'</span><span class="owner-lookup__copy"><span class="owner-lookup__name">'+escapeHtml(user.displayName)+'</span><span class="owner-lookup__meta">@'+escapeHtml(user.username)+' · '+escapeHtml(user.email)+'</span></span></button>';
      }).join('');
      if (isEmail(email) && !knownEmail(email) && !duplicate) {
        html += '<button class="owner-lookup__result" type="button" role="option" data-owner-invite="'+escapeHtml(email)+'"><span class="owner-lookup__avatar">@</span><span class="owner-lookup__copy"><span class="owner-lookup__name">'+escapeHtml(tr('ipentry.owner.invite-option', 'Create pending invitation'))+'</span><span class="owner-lookup__meta">'+escapeHtml(email)+'</span></span></button>';
      }
      if (!html) {
        html = '<div class="owner-lookup__result owner-lookup__result--empty" role="status">'+escapeHtml(duplicate ? tr('ipentry.owner.duplicate', 'This email already has a pending invitation.') : isEmail(email) ? tr('ipentry.owner.no-result', 'No registered user matches this email.') : tr('ipentry.owner.invalid', 'No matching user. Enter a complete email to invite.'))+'</div>';
      }
      results.innerHTML = html;
      results.hidden = false;
      setStatus(duplicate ? tr('ipentry.owner.duplicate', 'This email already has a pending invitation.') : '', duplicate ? 'error' : '');
      results.querySelectorAll('[data-owner-id]').forEach(function (button) {
        button.addEventListener('mousedown', function (event) {
          event.preventDefault();
          var user = directory.filter(function (candidate) { return candidate.id === button.dataset.ownerId; })[0];
          if (!user) return;
          state = { kind:'linked', user:user };
          input.value = user.displayName;
          hideResults();
          setStatus(tr('ipentry.owner.linked', 'Linked to {name} (@{username}).', { name:user.displayName, username:user.username }), 'linked');
          emit();
        });
      });
      results.querySelectorAll('[data-owner-invite]').forEach(function (button) {
        button.addEventListener('mousedown', function (event) {
          event.preventDefault();
          state = { kind:'invite', email:button.dataset.ownerInvite };
          input.value = state.email;
          hideResults();
          setStatus(tr('ipentry.owner.invite-pending', 'Invitation will be created and queued after this entry is saved.'), 'invite');
          emit();
        });
      });
    }
    function restore(value) {
      if (!value || !value.kind) return;
      if (value.kind === 'linked') {
        var user = value.userId ? directory.filter(function (candidate) { return candidate.id === value.userId; })[0] : null;
        user = user || directory.filter(function (candidate) { return candidate.email === value.email; })[0];
        if (user) {
          state = { kind:'linked', user:user };
          input.value = user.displayName;
          setStatus(tr('ipentry.owner.linked', 'Linked to {name} (@{username}).', { name:user.displayName, username:user.username }), 'linked');
          emit();
        }
      } else if (value.kind === 'invite' && value.email) {
        state = { kind:'invite', email:value.email.toLowerCase() };
        input.value = state.email;
        setStatus(tr('ipentry.owner.invite-pending', 'Invitation will be created and queued after this entry is saved.'), 'invite');
        emit();
      }
    }
    input.addEventListener('input', renderResults);
    input.addEventListener('focus', renderResults);
    input.addEventListener('blur', function () { window.setTimeout(hideResults, 120); });
    document.addEventListener('i18n:applied', function () {
      input.setAttribute('aria-label', tr('ipentry.owner.input-label', 'Owner search'));
      input.setAttribute('placeholder', tr('ipentry.owner.placeholder', 'Search username or email'));
    });
    restore(options.initialValue);
    return {
      getValue:function () { return state.kind === 'linked' ? { kind:'linked', user:state.user } : state.kind === 'invite' ? { kind:'invite', email:state.email } : { kind:'empty' }; },
      focus:function () { input.focus(); },
      setValue:restore
    };
  }

  window.OwnerLookup = { mount:mount };
}());
