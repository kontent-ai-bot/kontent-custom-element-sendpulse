var currentValue = null;
var isDisabled = true;
var config = null;
var list = null;

function updateDisabled(disabled) {
  var elements = $(".selector").add(".remove").add(".spacer");
  if (disabled) {
    elements.hide();
  } else {
    elements.show();
  }
  updateSize();
  isDisabled = disabled;
}

function updateSize() {
  // Update the custom element height in the Kentico UI.
  const height = Math.ceil($("html").height());
  CustomElement.setHeight(height);
}

function validateConfig() {
  if (!config.apiId) {
    console.error(
      "Missing SendPulse API id. Please, provide the Sendpulse API Id through the custom element JSON config."
    );
  }

  if (!config.functionUrl) {
    console.error(
      "Missing the middleware function URL. Please, provide the URL through the custom element JSON config."
    )
  }
}

function getMailingLists(val) {
  $.ajax({
    url: config.functionUrl,
    dataType: "json",
    headers: {
      "x-api-userid": config.apiId
    },
    success: function (response) {
      list = response;
      fillDropDown(val);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function fillDropDown(val) {
  const $dropdown = $(".form__dropdown");
  for (var i = 0; i < list.length; i++) {
    var option = document.createElement("option");
    option.value = list[i].name;
    option.text = list[i].name;
    $dropdown[0].appendChild(option);
  }
  if (val) {
    $('#dropdown [value="' + val.name + '"]').attr("selected", "true");
  }
}

function renderSelected(form) {
  const $titleText = $(".title").find(".text");
  const $infoText = $(".title").find(".info");
  if (form) {
    $titleText.html(
      "<b>Selected mailing list:</b> " +
      form.name +
      ` <a class="remove" onclick="remove()">Remove</a>`
    );
    $infoText.html(
      "Total number of emails: " +
      form.all_email_qty +
      "<br>" +
      "Number of active emails: " +
      form.active_email_qty +
      "<br>" +
      "Number of inactive emails: " +
      form.inactive_email_qty +
      "<br>" +
      "Date of creation: " +
      form.creationdate
    );
    $infoText.addClass("title--selected");
    $titleText.addClass("title--selected");
  } else {
    $titleText.text("No mailing list selected");
    $titleText.removeClass("title--selected");
    $infoText.text("");
  }
  updateSize();
}

function remove() {
  $("#dropdown").find("option:disabled").prop("selected", "selected");
  formSelected(null);
}

function formSelected(ml) {
  if (!isDisabled) {
    if (ml) {
      currentValue = list.find((x) => x.name == ml);
      CustomElement.setValue(JSON.stringify(currentValue));
      renderSelected(currentValue);
    } else {
      currentValue = null;
      CustomElement.setValue(null);
      renderSelected(null);
    }
  }
}

function setupSelector(value) {
  if (value) {
    getMailingLists(JSON.parse(value));
    currentValue = JSON.parse(value);
    renderSelected(currentValue);
  } else {
    getMailingLists(null);
    renderSelected(null);
  }
  window.addEventListener("resize", updateSize);
}

function initCustomElement() {
  updateSize();
  try {
    CustomElement.init((element, _context) => {
      config = element.config || {};
      validateConfig();
      setupSelector(element.value);
      updateDisabled(element.disabled);
      updateSize();
    });
    // React on disabled changed (e.g. when publishing the item)
    CustomElement.onDisabledChanged(updateDisabled);
  } catch (err) {
    // Initialization with Kentico Custom element API failed (page displayed outside of the Kentico UI)
    console.error(err);
    setupSelector();
    updateDisabled(true);
  }
}

initCustomElement();
