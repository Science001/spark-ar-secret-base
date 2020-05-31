// Spark AR Modules
const TouchGestures = require('TouchGestures');
const CameraInfo = require('CameraInfo');
const Diagnostics = require('Diagnostics');

// Custom Scripts
import getElements from './getElements.js';
import { setSun, setPicker, setInstruction, setMovementInstructions, setInteractionInstruction, unsetAllInstructions } from './setup.js';
import { actionOnRotate, actionOnPinch, actionOnTap } from './interactions.js';
import { rotatePlane, scalePlane, movePlane, revealPlane } from './movements.js';


// Globals
var rotated = false, pinched = false, tapped = false, placed = false, isBackCamera = false;
var splitDownDriver, stageDriver, splitDriver, scaleDriver, currentMode = 'MOVE';
const elementNames = ['sunController', 'sunLight', 'airplaneArmature', 'stage', 'lightBall', 'splitL', 'splitR', 'environment', 'planeTracker', 'placer'];
const textureNames = ['airplaneIcon', 'moveIcon'];
const modes = ['MOVE', 'INTERACT'];

getElements(elementNames, textureNames)
    .then(l => {

        l.placer.hidden = true;

        // Set the sun position
        setSun(l.sunLight, l.sunController);

        // Set the NativeUI picker
        const picker = setPicker(l.texture.moveIcon, l.texture.airplaneIcon);
        picker.selectedIndex.monitor().subscribe(index => {
            currentMode = modes[index.newValue];
            decideInstructions();
        });

        // Set Instructions
        CameraInfo.captureDevicePosition.monitor({ fireOnInitialValue: true }).subscribe(pos => {
            isBackCamera = pos.newValue === 'BACK';
            decideInstructions();
        })

        // Subscribe to touch gestures
        TouchGestures.onRotate().subscribeWithSnapshot({
            'lastRotationY': l.placer.transform.rotationY
        }, (gesture, snapshot) => {
            if (currentMode === 'MOVE')
                rotatePlane(l.placer.transform, gesture, snapshot);
            else if (!rotated) {
                unsetAllInstructions();
                splitDownDriver = actionOnRotate(l.splitL, l.splitR, () => {
                    rotated = true;
                    if(!tapped) setInteractionInstruction('pinch_to_change');
                });
            }
        });

        TouchGestures.onPinch().subscribeWithSnapshot({
            'lastScaleX': l.placer.transform.scaleX,
            'lastScaleY': l.placer.transform.scaleY,
            'lastScaleZ': l.placer.transform.scaleZ
        }, (gesture, snapshot) => {
            if (currentMode === 'MOVE')
                scalePlane(l.placer.transform, gesture, snapshot);
            else if (rotated && !pinched) {
                unsetAllInstructions();
                [splitDriver, stageDriver, scaleDriver] = actionOnPinch(l.splitL, l.splitR, l.stage, l.airplaneArmature, () => {
                    pinched = true;
                    if(!tapped) setInteractionInstruction('tap_to_advance');
                });
            }
        });

        TouchGestures.onTap().subscribe(_ => {
            if (currentMode === 'MOVE' && !placed && isBackCamera) {
                revealPlane(l.placer);
                placed = true;
                picker.visible = true;
                setMovementInstructions();
            }
            else if (rotated && pinched && !tapped) {
                tapped = true;
                unsetAllInstructions();
                actionOnTap(splitDownDriver, splitDriver, stageDriver, scaleDriver, () => {
                    tapped = pinched = rotated = false;
                    if(currentMode === 'INTERACT') setInteractionInstruction('use_2_fingers_to_rotate');
                });
            }
        });

        TouchGestures.onPan().subscribe(gesture => {
            if (currentMode === 'MOVE')
                movePlane(gesture, l.planeTracker);
        });

    })
    .catch(err => {
        Diagnostics.log("Error")
        Diagnostics.log(err);
    })

function decideInstructions() {
    if (!isBackCamera) setInstruction('switch_camera_view_to_place');
    else if (!placed) setInstruction('tap_to_place_on_surface');
    else if (currentMode === 'MOVE') setMovementInstructions();
    else setInteractionInstruction();
}