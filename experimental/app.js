$(() => {
  const $gif = $("#gif");
  const $gifLink = $("#gifLink");
  const $error = $("#error");
  const $record = $("#record");
  const $info = $record.find(".info");
  const $qualityBad = $("#quality-bad");
  const $lengthShort = $("#length-short");
  const $group = $(".group");
  const $countdown = $("#countdown");
  const $loader = $("#loader");
  const token = extractToken(document.location.hash);
  const $imgur = $("#imgur");
  const $imgurOauth = $("#imgur a:first");
  const $imgurAnon = $("#imgur a:last");
  const $imgurUpload = $("#imgur-upload");
  const clientId = "6a5400948b3b376";
  let loader;

  $imgurUpload.hide();
  $imgur.hide();
  $group.hide();
  $error.hide();
  $record.hide();

  $loader.knob().hide();
  $countdown.knob().hide();

  $imgur.find("a").click(() => {
    localStorage.doUpload = true;
  });

  $imgurOauth.attr("href", `${$imgurOauth.attr("href")}&client_id=${clientId}`);

  $imgurAnon.click(() => {
    imgurUpload();
  });

  function extractToken(hash) {
    const match = hash.match(/access_token=(\w+)/);
    return !!match && match[1];
  }

  function imgurUpload(token) {
    $imgurUpload.show();
    $group.hide();

    let auth;
    if (token) auth = `Bearer ${token}`;
    else auth = `Client-ID ${clientId}`;

    $.ajax({
      url: "https://api.imgur.com/3/image",
      type: "POST",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
      data: {
        image: localStorage.dataBase64,
        type: "base64",
      },
      success({data}) {
        const id = data.id;
        window.location = `https://imgur.com/gallery/${id}`;
      },
    });
  }

  if (token && JSON.parse(localStorage.doUpload)) {
    localStorage.doUpload = false;

    imgurUpload(token);

    return;
  }

  if (!("sendAsBinary" in XMLHttpRequest.prototype)) {
    XMLHttpRequest.prototype.sendAsBinary = function (string) {
      const bytes = Array.prototype.map.call(string, c => {
        return c.charCodeAt(0) & 0xff;
      });
      this.send(new Uint8Array(bytes).buffer);
    };
  }

  function startLoader() {
    let i = 0;
    loader = setInterval(() => {
      $loader.val(++i % 100).trigger("change");
    }, 10);
    $loader.knob().show();
  }

  function stopLoader() {
    clearInterval(loader);
    $loader.knob().hide();
  }

  on("prepare", err => {
    if (!!err) {
      $error.show();
    } else {
      $record.show();
      $group.show();
    }
  });

  on("building", () => {
    $info.text("Building...");
    startLoader();
  });

  on("gif", dataBase64 => {
    stopLoader();
    $record.removeClass("disabled recording");
    $info.text("Record");

    localStorage.dataBase64 = dataBase64;
    const dataUrl = `data:image/gif;base64,${dataBase64}`;
    $gif.attr("src", dataUrl).show();
    $gifLink.attr("href", dataUrl);
    $imgur.show();
  });

  function loading() {
    $gif.hide();
    $imgur.hide();
    $record.addClass("disabled");
    $info.text("Wait...");
    $countdown.knob().show();
  }

  function record() {
    $record.addClass("recording");
    $info.text("Recording...");

    const qualityBad = $qualityBad.prop("checked");
    const lengthShort = $lengthShort.prop("checked");

    gifie.init({
      quality: qualityBad ? 10 : 30,
      length: lengthShort ? 15 : 5,
    });
  }

  $record.click(() => {
    loading();
    $countdown.val($countdown.data("max")).trigger("change");
    const interval = setInterval(() => {
      $countdown.val($countdown.val() - 1).trigger("change");
      if ($countdown.val() > 0) return;

      clearInterval(interval);
      $countdown.knob().hide();
      record();
    }, 10);
  });

  gifie.prepare();
});

const listeners = {};
on = (name, cb) => {
  listeners[name] = cb;
};
trigger = function (name) {
  const cb = listeners[name];
  if (cb) cb(...[].slice.call(arguments, 1));
};
