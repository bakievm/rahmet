function processImage(vId) {
    // **********************************************
    // *** Update or verify the following values. ***
    // **********************************************

    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "8dd198a851df4f8f98a10f24d3216f16";

    // Replace or verify the region.
    //
    // You must use the same region in your REST API call as you used to obtain your subscription keys.
    // For example, if you obtained your subscription keys from the westus region, replace
    // "westcentralus" in the URI below with "westus".
    //
    // NOTE: Free trial subscription keys are generated in the westcentralus region, so if you are using
    // a free trial subscription key, you should not need to change this region.
    var uriBase = "https://eastasia.api.cognitive.microsoft.com/face/v1.0/detect";

    // Request parameters.
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender,smile,emotion",
    };

    // Display the image.
    var sourceImageUrl = "https://upload.wikimedia.org/wikipedia/commons/c/c3/RH_Louise_Lillian_Gish.jpg";
    document.querySelector("#sourceImage").src = sourceImageUrl;

    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

    .done(function(data) {
        // Show formatted JSON on webpage.
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        var response = data;
        var token  = $('meta[name=_token]').attr('content');
		$.ajaxSetup({ headers: { 'X-CSRF-TOKEN': token, 'csrftoken': token }});
        $.ajax({
            url: "/view",
            type: "POST",
            data: {'name': response.faceId, 'yt_id': vId, 'age': response.age, 'gender': response.gender, 'smile': response.smile},
            dataType: "json",
            cache: false,
            success: function (response) {
                if (response.status === true) {
                    console.log('success');
                } else {
                    $('#errcallbackModalOtp').html('Some error occured .. Please try again later');
                }
            },
            error: function (response) {
                    $('#errcallbackModalOtp').html(response.message);
            }
        })
    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        // Display error message.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
            jQuery.parseJSON(jqXHR.responseText).message : jQuery.parseJSON(jqXHR.responseText).error.message;
        alert(errorString);
    });
};
$('#start_demo').click(function(){
    var vId = $('tr#1 td #yt_id_text').html();
    captureMe();
    processImage(vId);
    $('#video').YTPlayer({
      fitToBackground: false,
      videoId: vId,
      pauseOnScroll: false,
      playerVars: {
        modestbranding: 0,
        autoplay: 1,
        controls: 1,
        showinfo: 0,
        wmode: 'transparent',
        branding: 0,
        rel: 0,
        autohide: 0,
        origin: window.location.origin
      }
    });
    
})
var video = document.getElementById('stream');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// функция которая будет выполнена при нажатии на кнопку захвата кадра
function captureMe() {
    if (!videoStreamUrl) alert('То-ли вы не нажали "разрешить" в верху окна, то-ли что-то не так с вашим видео стримом')
    // переворачиваем canvas зеркально по горизонтали (см. описание внизу статьи)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    // отрисовываем на канвасе текущий кадр видео
    context.drawImage(video, 0, 0, video.width, video.height);
    // получаем data: url изображения c canvas
    var base64dataUrl = canvas.toDataURL('image/png');
    context.setTransform(1, 0, 0, 1, 0, 0); // убираем все кастомные трансформации canvas
    // на этом этапе можно спокойно отправить  base64dataUrl на сервер и сохранить его там как файл (ну или типа того) 
    // но мы добавим эти тестовые снимки в наш пример:
    var img = new Image();
    img.src = base64dataUrl;
    img.id = "base64";
    window.document.body.appendChild(img);
}
// navigator.getUserMedia  и   window.URL.createObjectURL (смутные времена браузерных противоречий 2012)
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL;
// запрашиваем разрешение на доступ к поточному видео камеры
navigator.getUserMedia({video: true}, function (stream) {
    // разрешение от пользователя получено
    // получаем url поточного видео
    videoStreamUrl = window.URL.createObjectURL(stream);
    // устанавливаем как источник для video 
    video.src = videoStreamUrl;
}, function () {
    console.log('что-то не так с видеостримом или пользователь запретил его использовать :P');
});