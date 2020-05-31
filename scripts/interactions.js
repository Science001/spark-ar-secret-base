const Animation = require('Animation');
const Patches = require('Patches');
const Time = require('Time');
const Diagnostics = require('Diagnostics');

export function actionOnRotate(splitL, splitR, cb) {
    const splitDownDriver = Animation.timeDriver({
        durationMilliseconds: 1000,
        loopCount: 1,
        mirror: false
    });
    splitDownDriver.start();
    const splitSampler = Animation.samplers.easeInOutSine(-0.00022, -0.00868);
    const splitAnimation = Animation.animate(splitDownDriver, splitSampler);
    splitL.transform.y = splitAnimation;
    splitR.transform.y = splitAnimation;
    splitDownDriver.onCompleted().subscribe(cb);
    return splitDownDriver;
}

export function actionOnPinch(splitL, splitR, stage, airplaneArmature, cb) {
    //Splits
    const splitDriver = Animation.timeDriver({
        durationMilliseconds: 3000,
        loopCount: 1,
        mirror: false
    });
    const splitLSampler = Animation.samplers.linear(-0.13636, -0.22195);
    const splitRSampler = Animation.samplers.linear(-0.04545, 0.04272);
    splitL.transform.x = Animation.animate(splitDriver, splitLSampler);
    splitR.transform.x = Animation.animate(splitDriver, splitRSampler);

    //Stage Movement
    const stageDriver = Animation.timeDriver({
        durationMilliseconds: 3000,
        loopCount: 1,
        mirror: false
    });
    stage.transform.y = Animation.animate(stageDriver, Animation.samplers.linear(-0.06094, -0.00825));
    const airplaneDriver = stageDriver;
    airplaneArmature.transform.y = Animation.animate(airplaneDriver, Animation.samplers.linear(-0.03271, 0.01884));
    
    //Stage Scale
    const scaleDriver = Animation.timeDriver({
        durationMilliseconds: 2000,
        loopCount: 1,
        mirror: false
    });
    stage.transform.scaleX = Animation.animate(scaleDriver, Animation.samplers.linear(1, 1.11));
    stage.transform.scaleZ = Animation.animate(scaleDriver, Animation.samplers.linear(1, 1.11));

    //Play 'em
    splitDriver.start();
    Time.setTimeout(() => {
        stageDriver.start();
        airplaneDriver.start();
    }, 1000);
    Time.setTimeout(() => (scaleDriver.start()), 4000)
    scaleDriver.onCompleted().subscribe(cb);
    return [splitDriver, stageDriver, scaleDriver];
}

export function actionOnTap(splitDownDriver, splitDriver, stageDriver, scaleDriver, cb) {
    Patches.inputs.setBoolean('playAirplane', true);
    Time.setTimeout(() => {
        Patches.inputs.setBoolean('playAirplane', false);
        cb();
    }, 10833);
    scaleDriver.reverse();
    stageDriver.reverse();
    Time.setTimeout(() => (splitDriver.reverse()), 1000);
    Time.setTimeout(() => (splitDownDriver.reverse()), 4000);
}