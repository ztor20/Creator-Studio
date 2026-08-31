/* Artist picker — search the Ztor user pool, add users, or invite by email / SMS.
   (2026-07-27, L: the "＋ Add artist" flow)

   Requirements this implements:
     1. search the Ztor user database
     2. add an existing user straight onto the project
     3. if they are not registered, invite them by email or SMS
     4. once they join they are linked to this project automatically

   ── Why this is not just OwnerLookup ────────────────────────────────────
   `partials/owner-lookup.js` already does search → link → or offer a pending
   email invite, and this file deliberately reuses its `.owner-lookup__*`
   visuals so the popover looks native from day one. It is a separate module
   for two reasons OwnerLookup cannot express:
     · OwnerLookup holds ONE value (a single IP owner). Featured artists is a
       LIST.
     · OwnerLookup invites by email only. Here a person can be reached by
       email OR SMS, and the channel is inferred from the query.
   Do not "consolidate" the two by forcing a list into OwnerLookup — the
   single-value contract is load-bearing for admin-ip-bank-entry.

   ── An entry is exactly one of two things ───────────────────────────────
     { kind:'linked',  user:{id,name,username,email,phone} }
       A resolved Ztor account. Creditable, payable, can hold splits.
     { kind:'pending', channel:'email'|'sms', contact:'…' }
       Invited, no account yet. Occupies a credit slot but CANNOT be paid.
       The contact value is the reconciliation key requirement 4 needs.

   There is deliberately NO third "just a name" state: requirement 3 says a
   non-registered person gets invited, so a contact method is mandatory. The
   old free-text field allowed bare names that could never be linked or
   invited — that dead end is the thing being removed.

   ⚠ PROTOTYPE HONESTY: nothing is actually sent. No email, no SMS. This
   queues the pending record and states the promise in the UI. The
   auto-link-on-join reconciliation (requirement 4) is a BACKEND contract and
   is not implemented here.

   Directory source: `window.ztorCreator.registered` — the BR-02 pre-registered
   pool already used by the「建立 creator」onboard wizard. Six demo accounts,
   not real users. */
(function () {
  'use strict';

  function tr(key, fallback, values) {
    var text = window.i18nT ? (window.i18nT(key) || fallback) : fallback;
    Object.keys(values || {}).forEach(function (name) { text = text.replace('{' + name + '}', values[name]); });
    return text;
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  /* Phone: optional +, then digits with spaces/dashes/parens. Require ≥8 digits
     so a track number or a year is never mistaken for a phone number. */
  function isPhone(v) { return /^\+?[\d\s()\-]+$/.test(v) && (v.replace(/\D/g, '').length >= 8); }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }

  function mount(options) {
    var host = options.host;
    var directory = options.directory || [];
    var entries = [];
    var input, results, list, status;

    host.innerHTML =
      '<div class="owner-lookup artist-picker">' +
        '<input class="input" type="search" autocomplete="off" data-ap-input>' +
        '<div class="owner-lookup__results" data-ap-results role="listbox" hidden></div>' +
        '<div class="artist-picker__list" data-ap-list></div>' +
        '<p class="owner-lookup__status" data-ap-status role="status" hidden></p>' +
      '</div>';
    input = host.querySelector('[data-ap-input]');
    results = host.querySelector('[data-ap-results]');
    list = host.querySelector('[data-ap-list]');
    status = host.querySelector('[data-ap-status]');

    function applyStrings() {
      input.setAttribute('aria-label', tr('cpp.ap.input-label', 'Search artists'));
      input.setAttribute('placeholder', tr('cpp.ap.placeholder', 'Search name, @username, email or phone'));
    }
    applyStrings();

    function emit() {
      if (options.onChange) options.onChange(entries.slice());
      host.dispatchEvent(new CustomEvent('artistpicker:change', { bubbles: true, detail: { entries: entries.slice() } }));
    }
    function setStatus(msg, state) {
      status.textContent = msg || '';
      status.dataset.state = state || '';
      status.hidden = !msg;
    }
    function hideResults() { results.hidden = true; results.innerHTML = ''; }

    function addedUserIds() { return entries.filter(function (e) { return e.kind === 'linked'; }).map(function (e) { return e.user.id; }); }
    function isAdded(user) { return addedUserIds().indexOf(user.id) !== -1; }
    function isPendingContact(contact) {
      var d = digits(contact), lc = String(contact).toLowerCase();
      return entries.some(function (e) {
        if (e.kind !== 'pending') return false;
        return e.channel === 'email' ? e.contact.toLowerCase() === lc : digits(e.contact) === d;
      });
    }
    /* Inviting somebody who ALREADY has an account is the worst outcome: they
       get a pointless message and never get linked. So before offering an
       invite, check the contact against the directory and prefer linking. */
    function userByContact(contact) {
      var lc = String(contact).toLowerCase(), d = digits(contact);
      return directory.filter(function (u) {
        return (u.email && u.email.toLowerCase() === lc) || (u.phone && d && digits(u.phone) === d);
      })[0] || null;
    }

    function matches(query) {
      var q = query.toLowerCase();
      return directory.filter(function (u) {
        return [u.name, u.username, '@' + u.username, u.email, u.phone]
          .some(function (v) { return v && String(v).toLowerCase().indexOf(q) !== -1; });
      });
    }

    function renderList() {
      if (!entries.length) { list.innerHTML = ''; return; }
      list.innerHTML = entries.map(function (e, i) {
        var removeBtn =
          '<button class="btn btn--icon btn--xs artist-picker__remove" type="button" data-ap-remove="' + i + '"' +
          ' aria-label="' + esc(tr('cpp.ap.remove', 'Remove artist')) + '">' +
          '<i data-lucide="trash-2" class="ztor-icon"></i></button>';
        if (e.kind === 'linked') {
          return '<div class="artist-picker__row">' +
              '<span class="owner-lookup__avatar">' + esc(e.user.name.slice(0, 1)) + '</span>' +
              '<span class="owner-lookup__copy">' +
                '<span class="owner-lookup__name">' + esc(e.user.name) + '</span>' +
                '<span class="owner-lookup__meta">@' + esc(e.user.username) + ' · ' + esc(e.user.email) + '</span>' +
              '</span>' + removeBtn +
            '</div>';
        }
        /* Pending: icon + contact + an "Invited" badge + the link-on-join
           promise. Icon AND text AND badge, so the state never depends on
           colour alone. */
        var icon = e.channel === 'sms' ? 'message-square' : 'mail';
        return '<div class="artist-picker__row artist-picker__row--pending">' +
            '<span class="owner-lookup__avatar"><i data-lucide="' + icon + '" class="ztor-icon"></i></span>' +
            '<span class="owner-lookup__copy">' +
              '<span class="owner-lookup__name">' + esc(e.contact) +
                ' <span class="badge badge--warning badge--inline">' + esc(tr('cpp.ap.invited', 'Invited')) + '</span></span>' +
              '<span class="owner-lookup__meta">' + esc(tr('cpp.ap.pending-note', 'Not on Ztor yet — linked to this project automatically when they join.')) + '</span>' +
            '</span>' + removeBtn +
          '</div>';
      }).join('');
      list.querySelectorAll('[data-ap-remove]').forEach(function (b) {
        b.addEventListener('click', function (ev) {
          ev.preventDefault();
          entries.splice(Number(b.dataset.apRemove), 1);
          renderList(); emit();
        });
      });
      if (window.ztorIcons) window.ztorIcons.applyIcons(list);
    }

    function renderResults() {
      var query = input.value.trim();
      if (!query) { hideResults(); setStatus('', ''); return; }

      var html = matches(query).map(function (u) {
        var added = isAdded(u);
        return '<button class="owner-lookup__result" type="button" role="option"' +
            (added ? ' disabled aria-disabled="true"' : '') +
            ' data-ap-user="' + esc(u.id) + '">' +
            '<span class="owner-lookup__avatar">' + esc(u.name.slice(0, 1)) + '</span>' +
            '<span class="owner-lookup__copy">' +
              '<span class="owner-lookup__name">' + esc(u.name) +
                (added ? ' <span class="owner-lookup__tag">' + esc(tr('cpp.ap.already', 'Already added')) + '</span>' : '') + '</span>' +
              '<span class="owner-lookup__meta">@' + esc(u.username) + ' · ' + esc(u.email) + (u.phone ? ' · ' + esc(u.phone) : '') + '</span>' +
            '</span>' +
          '</button>';
      }).join('');

      var email = isEmail(query), phone = isPhone(query);
      if (email || phone) {
        var existing = userByContact(query);
        if (existing) {
          /* Contact belongs to a registered account → offer the LINK, not an invite. */
          if (!isAdded(existing)) {
            html += '<button class="owner-lookup__result" type="button" role="option" data-ap-user="' + esc(existing.id) + '">' +
                '<span class="owner-lookup__avatar">' + esc(existing.name.slice(0, 1)) + '</span>' +
                '<span class="owner-lookup__copy">' +
                  '<span class="owner-lookup__name">' + esc(tr('cpp.ap.link-existing', 'Already on Ztor — add {name}', { name: existing.name })) + '</span>' +
                  '<span class="owner-lookup__meta">@' + esc(existing.username) + '</span>' +
                '</span></button>';
          }
        } else if (isPendingContact(query)) {
          html += '<div class="owner-lookup__result owner-lookup__result--empty" role="status">' +
            esc(tr('cpp.ap.dup-invite', 'This contact already has a pending invitation.')) + '</div>';
        } else {
          var ch = email ? 'email' : 'sms';
          html += '<button class="owner-lookup__result" type="button" role="option" data-ap-invite="' + esc(query) + '" data-ap-channel="' + ch + '">' +
              '<span class="owner-lookup__avatar"><i data-lucide="' + (email ? 'mail' : 'message-square') + '" class="ztor-icon"></i></span>' +
              '<span class="owner-lookup__copy">' +
                '<span class="owner-lookup__name">' + esc(email
                  ? tr('cpp.ap.invite-email', 'Invite by email')
                  : tr('cpp.ap.invite-sms', 'Invite by SMS')) + '</span>' +
                '<span class="owner-lookup__meta">' + esc(query) + '</span>' +
              '</span></button>';
        }
      }

      if (!html) {
        /* No match and not a usable contact — say what WOULD work rather than
           offering a dead "add anyway" that can never be linked or invited. */
        html = '<div class="owner-lookup__result owner-lookup__result--empty" role="status">' +
          esc(tr('cpp.ap.no-result', 'No one matches. Enter a full email or phone number to invite them.')) + '</div>';
      }
      results.innerHTML = html;
      results.hidden = false;
      if (window.ztorIcons) window.ztorIcons.applyIcons(results);

      results.querySelectorAll('[data-ap-user]').forEach(function (b) {
        if (b.disabled) return;
        b.addEventListener('mousedown', function (ev) {
          ev.preventDefault();
          var u = directory.filter(function (c) { return c.id === b.dataset.apUser; })[0];
          if (!u || isAdded(u)) return;
          entries.push({ kind: 'linked', user: u });
          input.value = ''; hideResults(); renderList();
          setStatus(tr('cpp.ap.added', 'Added {name}.', { name: u.name }), 'linked');
          emit();
        });
      });
      results.querySelectorAll('[data-ap-invite]').forEach(function (b) {
        b.addEventListener('mousedown', function (ev) {
          ev.preventDefault();
          entries.push({ kind: 'pending', channel: b.dataset.apChannel, contact: b.dataset.apInvite });
          input.value = ''; hideResults(); renderList();
          setStatus(b.dataset.apChannel === 'sms'
            ? tr('cpp.ap.queued-sms', 'SMS invitation queued — it sends when you publish.')
            : tr('cpp.ap.queued-email', 'Email invitation queued — it sends when you publish.'), 'invite');
          emit();
        });
      });
    }

    input.addEventListener('input', renderResults);
    input.addEventListener('focus', renderResults);
    input.addEventListener('blur', function () { window.setTimeout(hideResults, 120); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hideResults(); setStatus('', ''); } });
    document.addEventListener('i18n:applied', function () { applyStrings(); renderList(); });

    return {
      focus: function () { input.focus(); },
      getEntries: function () { return entries.slice(); },
      clear: function () { entries = []; renderList(); setStatus('', ''); emit(); }
    };
  }

  window.ArtistPicker = { mount: mount };
}());
