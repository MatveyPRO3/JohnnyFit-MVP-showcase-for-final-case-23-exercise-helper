const video = document.getElementsByClassName('input_video5')[0];
const out = document.getElementsByClassName('output5')[0];
const controlsElement = document.getElementsByClassName('control5')[0];
const canvasCtx = out.getContext('2d');
const loading_pic = document.getElementById("loading_pic")
const fpsControl = new FPS();
var loading_deleted = false;

function onResultsPose(results) {

    if (!loading_deleted) {
        loading_pic.remove();
        loading_deleted = true;
    }

    fpsControl.tick();

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, out.width, out.height);
    canvasCtx.drawImage(
        results.image, 0, 0, out.width, out.height);

    if (!results.poseLandmarks) {
        return
    }

    drawConnectors(
        canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        {
            color: "rgb(3, 252, 32)"
        }
    );
    drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
        { color: "red", fillColor: 'red' });
    drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
        { color: "blue", fillColor: 'blue' });
    drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
        { color: "yellow", fillColor: 'yellow' });
    canvasCtx.restore();
}

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
    }
});
pose.onResults(onResultsPose);



const camera = new Camera(video, {
    onFrame: async () => {
        await pose.send({ image: video });
    },
    width: 960,
    height: 540,
    facingMode: 'environment'
});

camera.start();

new ControlPanel(controlsElement, {
    selfieMode: false,
    upperBodyOnly: false,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})
    .add([
        new StaticText({ title: 'MediaPipe Pose' }),
        fpsControl,
        new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
        new Toggle({ title: 'Upper-body Only', field: 'upperBodyOnly' }),
        new Toggle({ title: 'Smooth Landmarks', field: 'smoothLandmarks' }),
        new Slider({
            title: 'Min Detection Confidence',
            field: 'minDetectionConfidence',
            range: [0, 1],
            step: 0.01
        }),
        new Slider({
            title: 'Min Tracking Confidence',
            field: 'minTrackingConfidence',
            range: [0, 1],
            step: 0.01
        }),
    ])
    .on(options => {
        video.classList.toggle('selfie', options.selfieMode);
        pose.setOptions(options);
    });
