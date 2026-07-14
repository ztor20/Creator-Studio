window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* New Product Post composer · spec §5.1.5.7 (E-Shop · post a just-created
   product to fans, D068). Loaded as a <script> on e-shop.html (always
   available, file:// safe), injected into [data-product-post-host] and opened
   when the list is reached with ?posted=1 right after creating a product.

   Reuses the canonical dialog shell (.payout-modal / .payout-dialog) + the
   Broadcast composer fields (.msg-*, message-modal.css) because the sending
   system — audience, title≤120 / body≤2000, personalization tokens, schedule
   (now / +15min), in-app + Email channels, §7.8 wording — is the SAME as
   群發訊息 (5.1.7.1) and is NOT redefined here. Post-specific bits only:
   the F2 attached-product card (.npp-product) + Skip path.

   Title/close live on the popup frame (no page header, D067). Sample audience
   counts are illustrative demo data; product name/price are filled by e-shop. */
window.ZTOR_PARTIALS.productPostModal = String.raw`
<!-- New Product Post popup · spec §5.1.5.7 / D068 -->
<div class="payout-modal" data-npp-modal hidden>
  <section class="payout-dialog npp-dialog" role="dialog" aria-modal="true" aria-labelledby="npp-title">
    <div class="payout-dialog__head">
      <h2 class="payout-dialog__title" id="npp-title" data-i18n="npp.title">Share your new product</h2>
      <button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="npp.close" data-npp-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>

    <div class="payout-dialog__body">
      <p class="npp-intro" data-i18n="npp.intro">Your product is live. Announce it to your fans now, or skip and do it later.</p>

      <!-- F2 · Attached product (auto-filled from the product just created; bound to it) -->
      <div class="npp-product">
        <div class="npp-product__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
        <div class="npp-product__info">
          <span class="npp-product__name" data-npp-prod-name>New product</span>
          <span class="npp-product__meta">
            <span class="badge badge--success" data-i18n="npp.product.new">Just listed</span>
            <span class="npp-product__price" data-npp-prod-price>$24</span>
          </span>
        </div>
        <a class="npp-product__link" href="product-detail.html" data-i18n="npp.product.view">View product<i data-lucide="chevron-right" class="ztor-icon"></i></a>
      </div>

      <div class="msg-compose">
        <!-- F4 · Title (limit reused from 5.1.7.1 ≤120) -->
        <div class="msg-field">
          <div class="msg-field__label">
            <span class="msg-field__label-text"><span data-i18n="npp.field.title">Post title</span><span class="msg-field__req" aria-hidden="true">*</span></span>
            <span class="char-counter" data-npp-title-count>0 / 120</span>
          </div>
          <input class="input" data-npp-title maxlength="120" placeholder="e.g., New drop just landed" data-i18n-placeholder="npp.title.ph">
        </div>

        <!-- F4 · Body (limit reused from 5.1.7.1 ≤2000) + personalization tokens -->
        <div class="msg-field">
          <div class="msg-field__label">
            <span class="msg-field__label-text"><span data-i18n="npp.field.body">Post</span><span class="msg-field__req" aria-hidden="true">*</span></span>
            <span class="char-counter" data-npp-body-count>0 / 2000</span>
          </div>
          <textarea class="textarea" data-npp-body maxlength="2000" rows="5" placeholder="Tell your fans what makes it special…" data-i18n-placeholder="npp.body.ph"></textarea>
          <div class="msg-tokens">
            <span class="msg-tokens__hint" data-i18n="msg.tokens.hint">Insert personalization — replaced per recipient on send</span>
            <button class="msg-token" type="button" data-npp-token="{{first_name}}"><i data-lucide="plus" class="ztor-icon"></i>{{first_name}}</button>
            <button class="msg-token" type="button" data-npp-token="{{tier}}"><i data-lucide="plus" class="ztor-icon"></i>{{tier}}</button>
          </div>
        </div>

        <!-- F3 · Audience (segments reused from 5.1.7.1) -->
        <div class="msg-field">
          <div class="msg-field__label">
            <span class="msg-field__label-text"><span data-i18n="msg.to">To</span><span class="msg-field__req" aria-hidden="true">*</span></span>
          </div>
          <select class="select" data-npp-to>
            <option value="all" data-i18n="msg.to.all">All fans (1,840)</option>
            <option value="inner" data-i18n="msg.to.inner">Inner Circle (154)</option>
            <option value="super" data-i18n="msg.to.super">Superfan (359)</option>
            <option value="devoted" data-i18n="msg.to.devoted">Devoted (475)</option>
            <option value="fan" data-i18n="msg.to.fan">Fan (295)</option>
            <option value="risk" data-i18n="msg.to.risk">At risk (5)</option>
            <option value="recovered" data-i18n="msg.to.recovered">Recovered (18)</option>
          </select>
        </div>

        <!-- F5 · Timing & delivery (schedule + tz reused from 5.1.7.1) -->
        <div class="msg-field">
          <div class="msg-schedule">
            <div class="msg-schedule__label">
              <span class="msg-schedule__title" data-i18n="msg.schedule">Schedule for later</span>
              <span class="msg-schedule__hint" data-i18n="msg.schedule.hint">Send now, or pick a future date &amp; time</span>
            </div>
            <button class="switch" type="button" role="switch" aria-checked="false" data-npp-sched aria-label="Schedule for later" data-i18n-aria-label="msg.schedule"></button>
          </div>
          <div class="msg-schedule-when" data-npp-when hidden>
            <div class="msg-field">
              <span class="msg-field__label-text" data-i18n="msg.schedule.date">Date</span>
              <input class="input" type="date" data-npp-date>
            </div>
            <div class="msg-field">
              <span class="msg-field__label-text" data-i18n="msg.schedule.time">Time</span>
              <input class="input" type="time" data-npp-time>
            </div>
            <p class="msg-schedule-when__tz" data-i18n="msg.schedule.tz">Earliest is now + 15 min · account time zone</p>
          </div>
          <p class="msg-schedule-when__tz" data-i18n="npp.delivery">Fans are notified in-app and by Email per their preferences (5.1.7.1).</p>
        </div>
      </div>
    </div>

    <div class="payout-dialog__foot">
      <button class="btn btn--ghost" type="button" data-npp-skip data-i18n="npp.skip">Skip for now</button>
      <button class="btn btn--primary" type="button" data-npp-publish data-i18n="npp.publish">Publish post</button>
    </div>
  </section>
</div>
`;
