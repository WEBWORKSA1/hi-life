/* Hi.Life settings. Edit values here; no other file needs to change. */
window.HL_CONFIG = {
  /* Form inbox, stored encoded. Decoded only at the moment a form is sent. Do not replace with plain text. */
  inbox: [122, 120, 116, 57, 123, 126, 118, 122, 112, 87, 38, 118, 100, 124, 101, 120, 96, 117, 114, 96],
  formEndpoint: "https://formsubmit.co/ajax/",

  /* AdSense display-unit slot IDs. Leave blank until approved; Auto ads work without them. */
  adSlots: { "in-content": "", "sidebar": "", "home-mid": "", "tool-result": "" },

  /* Payment links for the Support page. When blank, the page collects a pledge and you reply with a link. */
  donate: {
    paypal: "",        /* e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX */
    stripe: "",        /* e.g. https://buy.stripe.com/XXXX (one-time) */
    stripeMonthly: "", /* e.g. https://buy.stripe.com/YYYY (subscription) */
    bmc: ""            /* e.g. https://buymeacoffee.com/yourname */
  },

  /* Contest shown on the Contests page and home page. */
  contest: {
    name: "My Best Life Upgrade Story",
    prize: "US$250 cash (PayPal or bank transfer)",
    runnerUp: "Three runners-up win US$50 each and a featured story on Hi.Life",
    closes: "2027-02-28",
    sponsor: ""
  },

  /* Floating "Free Life Plan" bar after the visitor scrolls 40% of a page. */
  stickyLead: true,
  cookieNotice: true
};
