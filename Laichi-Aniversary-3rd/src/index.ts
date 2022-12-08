import { PoseEngine } from "@geenee/bodyprocessors";
import { Recorder } from "@geenee/armature";
import { OutfitParams } from "@geenee/bodyrenderers-three";
import { AvatarRenderer } from "./avatarrenderer";
import { Snapshoter } from "@geenee/armature";
import AWS from 'aws-sdk';
import "./index.css";
import {int} from "aws-sdk/clients/datapipeline";
var crypto = require('crypto');

//function code taken from http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript


// Engine
const engine = new PoseEngine();
const token = location.hostname === "localhost" ?
    "GYVbLD-Eq5LbN83hb61hGqILwmvuo4dj" : "9SBXEXZBYAuy2hf7kfh8WtfyLG4L__k2";
const ID = '';
const SECRET = '';
const BUCKET_NAME = 'test-bucket';
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
})
// Parameters
const urlParams = new URLSearchParams(window.location.search);
let rear = urlParams.has("rear");
const params = {
    Bucket: BUCKET_NAME,
    CreateBucketConfiguration: {
        // Set your region here
        LocationConstraint: "eu-west-1"
    }
};

s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log('Bucket Created Successfully', data.Location);
});

// Retrieve



// Model map
const modelMap: {
    [key: string]: {
        file: string, avatar: boolean,
        outfit?: OutfitParams
    }
} = {
    onesie: {
        file: "Santa1.glb", avatar: false,
        outfit: {
            occluders: [/Head$/, /Body/],
            hidden: [/Eye/, /Teeth/, /Footwear/]
        }
    },
    jacket: {
        file: "hearttest.glb", avatar: false,
        outfit: {
            occluders: [/Head$/, /Body/],
            hidden: [/Eye/, /Teeth/, /Bottom/, /Footwear/, /Glasses/]
        }
    }
}
let model = "onesie";
let avatar = modelMap["onesie"].avatar;

// Create spinner element
function createSpinner() {
    const container = document.createElement("div");
    container.className = "spinner-container";
    container.id = "spinner";
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    for (let i = 0; i < 6; i++) {
        const dot = document.createElement("div");
        dot.className = "spinner-dot";
        spinner.appendChild(dot);
    }
    container.appendChild(spinner);
    return container;
}
// function makeid(length: any) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//         result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
// }
//ss
// function randomValueHex (len: any) {
//     return   crypto.randomBytes(64).toString('hex') // return required number of characters
// }
function random_unique(length: any) {
    var result           = '';
    var characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++ ) {
        var randomIndex = Math.floor(Math.random() * charactersLength);
        while (randomIndex > charactersLength) {
            var randomIndex = Math.floor(Math.random() * charactersLength);
        }
        result += characters[randomIndex];
        if (randomIndex > -1) {
            characters.splice(randomIndex, 1);
        }
    }
    return result;
}

async function main() {
    // AWS.config.setPromisesDependency();
    var random_character = random_unique(5)


    AWS.config.update({
        accessKeyId:"AKIATF73XGJ45T7G2K7F",
        secretAccessKey:"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",
        region:"ap-northeast-1",
    });


    // localStorage.setItem("lastname", random_character.toString());
    // //@ts-ignore
    // document.getElementById("demo").setAttribute("value", localStorage.getItem("lastname"))

    AWS.config.region = "ap-northeast-1";
    // document.getElementById("demo").innerHTML = localStorage.getItem("lastname");
    // let savelocal = document.getElementById(
    //     "demo") as HTMLInputElement | null;
    let s3 = new AWS.S3();
    // let object = s3.getObject({
    //     Bucket: 'laichi-vn-test-something',
    //     Key: 'test-image.png',
    //     // Body: '../snapshot.png'
    // }, (err, data) => {
    //     if (err)
    //         console.log(err);
    //     else
    //         console.log("Get Succesfully");
    //     // console.log(data)
    // })

    // console.log(object)
    // await s3.getObject({Bucket: 'laichi-vn-test-something',Key: 'test-image.png'},(err,data) => {
    //     if(err) console.log(err);
    //     else console.log(data);
    // })
    //var image = fs.createReadStream("../snapshot.png");
    //console.log(fs);

    // Renderer
    const container = document.getElementById("root");
    if (!container)
        return;
    const renderer = new AvatarRenderer(
        container, "crop", !rear, modelMap[model].file,
        avatar ? undefined : modelMap[model].outfit);
    // Camera switch
    const cameraSwitch = document.getElementById(
        "camera-switch") as HTMLButtonElement | null;
    if (cameraSwitch) {
        cameraSwitch.onclick = async () => {
            cameraSwitch.disabled = true;
            rear = !rear;
            await engine.setup({ size: { width: 1920, height: 1080 }, rear });
            await engine.start();
            renderer.setMirror(!rear);
            cameraSwitch.disabled = false;
        }
    }
    //Share facebook
    // Outfit switch
    const outfitSwitch = document.getElementById(
        "outfit-switch") as HTMLInputElement;
    outfitSwitch.checked = avatar;
    outfitSwitch.onchange = async () => {
        modelBtns.forEach((btn) => { btn.disabled = true; })
        outfitSwitch.disabled = true;
        const spinner = createSpinner();
        document.body.appendChild(spinner);
        avatar = outfitSwitch.checked;
        await renderer.setOutfit(
            modelMap[model].file,
            avatar ? undefined : modelMap[model].outfit);
        document.body.removeChild(spinner);
        modelBtns.forEach((btn) => { btn.disabled = false; });
        outfitSwitch.disabled = false;
    }


    // Recorder
    const safari = navigator.userAgent.indexOf('Safari') > -1 &&
        navigator.userAgent.indexOf('Chrome') <= -1
    const ext = safari ? "mp4" : "webm";
    const recorder = new Recorder(renderer, "video/" + ext);
    const recordButton = document.getElementById(
        "record") as HTMLButtonElement | null;
    if (recordButton)
        recordButton.onclick = () => {
            recorder?.start();
            setTimeout(async () => {
                const blob = await recorder?.stop();
                if (!blob)
                    return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.hidden = true;
                link.href = url;
                link.download = "capture." + ext;
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
            }, 10000);
        };
    // Model carousel
    const modelBtns = document.getElementsByName(
        "model") as NodeListOf<HTMLInputElement>;
    modelBtns.forEach((btn) => {
        btn.onchange = async () => {
            if (btn.checked && modelMap[btn.value]) {
                modelBtns.forEach((btn) => { btn.disabled = true; })
                outfitSwitch.disabled = true;
                const spinner = createSpinner();
                document.body.appendChild(spinner);
                model = btn.value;
                avatar = modelMap[model].avatar;
                await renderer.setOutfit(
                    modelMap[model].file,
                    avatar ? undefined : modelMap[model].outfit);
                outfitSwitch.checked = avatar;
                document.body.removeChild(spinner);
                modelBtns.forEach((btn) => { btn.disabled = false; });
                outfitSwitch.disabled = false;
            }
        };
    });


    // Snapshot
    const snapshoter = new Snapshoter(renderer);
    const snapshotButton = document.getElementById(
        "snapshot") as HTMLButtonElement | null;
    if (snapshotButton)
        snapshotButton.onclick = async () => {
            const image = await snapshoter.snapshot();
            if (!image)
                return;
            const canvas = document.createElement("canvas");
            canvas.id = "engeenee.snapshot";
            canvas.hidden = true;
            const context = canvas.getContext("2d", { alpha: true });
            if (!context) {
                canvas.remove();
                return;
            }
            canvas.width = image.width;
            canvas.height = image.height;
            context.putImageData(image, 0, 0);
            const url = canvas.toDataURL();
            const link = document.createElement("a");
            link.hidden = true;
            link.href = canvas.toDataURL();
            link.download = 'snapshot.png'

            // const base64Data =  Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const base64Response = await fetch(link.href);
            console.log(base64Response)
            const blob = await base64Response.blob();
            console.log(blob)
            await s3.putObject({
                Bucket: 'laichi-vn-test-something',
                Key: random_character,
                Body: blob,
                ContentEncoding: 'base64',
                ContentType: 'image/png',
            },(err,data) => {
                if(err) console.log(err);
                else console.log(random_character)
                    //luu local
                // else console.log("Upload thành công");
            })
            console.log(link.baseURI);
            window.location.reload();
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            canvas.remove();
        };
    // Initialization
    await Promise.all([
        engine.addRenderer(renderer),
        engine.init({ token: token })
    ]);
    await engine.setup({ size: { width: 1920, height: 1080 }, rear });
    await engine.start();
    document.getElementById("dots")?.remove();
}
main();

