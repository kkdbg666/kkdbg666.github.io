import {
    Camera3D,
    CameraUtil,
    Color,
    ComponentBase,
    BoxColliderShape,
    defaultTexture,
    DirectLight,
    Engine3D,
    FlyCameraController,
    ForwardRenderJob,
    GlobalIlluminationComponent,
    GUIHelp,
    PointerEvent3D,
    HDRBloomPost,
    HDRLitMaterial,
    HoverCameraController,
    KelvinUtil,
    MeshRenderer,
    Object3D,
    PlaneGeometry,
    Scene3D,
    SphereGeometry, Vector3,
    webGPUContext, Collider, BoxGeometry
} from '@orillusion/core';

export class ClickScript extends ComponentBase {

    protected start() {
        this.object3D.addEventListener(PointerEvent3D.PICK_CLICK, this.onPick, this);
    }

    onPick(e: PointerEvent3D) {
        console.log('onClick:', e);
        let mr: MeshRenderer = this.object3D.getComponent(MeshRenderer);
        mr.material.baseColor = Color.random();
    }
}

export class Sample_GI {
    lightObj: Object3D;
    cameraObj: Camera3D;
    scene: Scene3D;
    hover: HoverCameraController;
    constructor() { }

    async run() {
        await Engine3D.init({});

        Engine3D.engineSetting.debug.materialChannelDebug = true;

        Engine3D.engineSetting.globalIlluminationSetting.enable = true;
        Engine3D.engineSetting.globalIlluminationSetting.debug = true;
        Engine3D.engineSetting.globalIlluminationSetting.gridYCount = 3;
        Engine3D.engineSetting.globalIlluminationSetting.gridXCount = 6;
        Engine3D.engineSetting.globalIlluminationSetting.gridZCount = 6;
        Engine3D.engineSetting.globalIlluminationSetting.probeSpace = 36;
        Engine3D.engineSetting.globalIlluminationSetting.offsetX = -4;
        Engine3D.engineSetting.globalIlluminationSetting.offsetY = 29;
        Engine3D.engineSetting.globalIlluminationSetting.offsetZ = 7;
        Engine3D.engineSetting.globalIlluminationSetting.indirectIntensity = 2;
        Engine3D.engineSetting.globalIlluminationSetting.probeSize = 32;
        Engine3D.engineSetting.globalIlluminationSetting.octRTSideSize = 32;
        Engine3D.engineSetting.globalIlluminationSetting.autoRenderProbe = true;

        Engine3D.engineSetting.shadowSetting.shadowBound = 2;
        Engine3D.engineSetting.shadowSetting.shadowBias = -0.0008;
        Engine3D.engineSetting.shadowSetting.debug = false;

        Engine3D.engineSetting.shadowSetting.autoUpdate = true;
        Engine3D.engineSetting.shadowSetting.updateFrameRate = 1;

        //引擎启动前需要配置开启拾取和拾取类型
        Engine3D.engineSetting.pickerMode.enable = true;
        // Bound: 包围盒拾取, pixel: 帧缓冲区拾取
        Engine3D.engineSetting.pickerMode.mode = `bound`; // or 'pixel'

        Engine3D.engineSetting.renderSetting.postProcessing.bloom = {
            enable: true,
            blurX: 4,
            blurY: 4,
            intensity: 0.5,
            brightness: 1.25,
        };
        GUIHelp.init();

        this.scene = new Scene3D();
        let camera = CameraUtil.createCamera3DObject(this.scene);
        camera.perspective(60, webGPUContext.aspect, 1, 5000.0);
        let ctrl = camera.object3D.addComponent(FlyCameraController);
        ctrl.setCamera(new Vector3(-90, 90, 180), new Vector3(60, 0, -50));
        ctrl.moveSpeed = 300;
        //ctrl.setCamera(-60, -25, 100);

        let renderJob = new ForwardRenderJob(this.scene);
        renderJob.addPost(new HDRBloomPost());

        this.addGIProbes();

        renderJob.debug();
        Engine3D.startRender(renderJob);

        await this.initScene();
    }

    private addGIProbes() {
        let probeObj = new Object3D();
        let component = probeObj.addComponent(GlobalIlluminationComponent);
        this.scene.addChild(probeObj);
    }



    async initScene() {
        /******** light *******/
        {
            this.lightObj = new Object3D();
            this.lightObj.rotationX = 15;
            this.lightObj.rotationY = 110;
            this.lightObj.rotationZ = 0;
            let lc = this.lightObj.addComponent(DirectLight);
            lc.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
            lc.castShadow = true;
            lc.intensity = 5;
            lc.debug();
            this.scene.addChild(this.lightObj);
        }

        let ball: Object3D;
        {
            let mat = new HDRLitMaterial();
            mat.baseMap = defaultTexture.whiteTexture;
            mat.normalMap = defaultTexture.normalTexture;
            mat.aoMap = defaultTexture.whiteTexture;
            mat.maskMap = defaultTexture.createTexture(32, 32, 255.0, 255.0, 0.0, 1);
            mat.emissiveMap = defaultTexture.blackTexture;
            mat.roughness = 0.5;
            mat.metallic = 0.2;

            let floor = new Object3D();
            let mr = floor.addComponent(MeshRenderer);
            mr.geometry = new PlaneGeometry(200, 200);
            mr.material = mat;
            this.scene.addChild(floor);

            let floor2 = new Object3D();
            let mr2 = floor2.addComponent(MeshRenderer);
            mr2.geometry = new PlaneGeometry(100, 200);
            mr2.material = mat;
            floor2.rotationX=0;
            floor2.rotationY=0;
            floor2.rotationZ=90;
            floor2.transform.x=100;
            floor2.transform.y=50;
            floor2.transform.z=0;
            this.scene.addChild(floor2);

            let floor3 = new Object3D();
            let mr3 = floor3.addComponent(MeshRenderer);
            mr3.geometry = new PlaneGeometry(100, 200);
            mr3.material = mat;
            floor3.rotationX=90;
            floor3.rotationY=0;
            floor3.rotationZ=90;
            floor3.transform.x=0;
            floor3.transform.y=50;
            floor3.transform.z=-100;
            this.scene.addChild(floor3);

            let floor4 = new Object3D();
            let mr4 = floor4.addComponent(MeshRenderer);
            mr4.geometry = new PlaneGeometry(100, 200);
            mr4.material = mat;
            floor4.rotationX=-90;
            floor4.rotationY=0;
            floor4.rotationZ=90;
            floor4.transform.x=0;
            floor4.transform.y=50;
            floor4.transform.z=100;
            //this.scene.addChild(floor4);

            let floor5 = new Object3D();
            let mr5 = floor5.addComponent(MeshRenderer);
            mr5.geometry = new PlaneGeometry(100, 200);
            mr5.material = mat;
            floor5.rotationX=0;
            floor5.rotationY=0;
            floor5.rotationZ=-90;
            floor5.transform.x=-100;
            floor5.transform.y=50;
            floor5.transform.z=0;
            //this.scene.addChild(floor5);

            ball = new Object3D();
            mr = ball.addComponent(MeshRenderer);


            // 添加碰撞盒检测
            let collider = ball.addComponent(Collider);
            // bound 模式需要手动设置碰撞盒样式和大小
            // 拾取精度取决于 box.geometry 和 collider.shape 的匹配程度
            collider.shape = new BoxColliderShape().setFromCenterAndSize(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
            //ball.addComponent(ClickScript);


            mr.geometry = new SphereGeometry(6, 20, 20);
            mr.material = mat;
            mat.shaderState.acceptGI = true;
            this.scene.addChild(ball);
            ball.transform.x = 0;
            ball.transform.y = 70;
            ball.transform.z = -95;


        }

        let chair = (await Engine3D.res.loadGltf('https://cdn.orillusion.com/PBR/SheenChair/SheenChair.gltf', { onProgress: (e) => this.onLoadProgress(e), onComplete: (e) => this.onComplete(e) })) as Object3D;
        chair.scaleX = chair.scaleY = chair.scaleZ = 60;
        chair.transform.y = 0;
        chair.transform.x=70;
        chair.transform.z = -80;
        this.scene.addChild(chair);

        let Duck = (await Engine3D.res.loadGltf('https://cdn.orillusion.com/PBR/Duck/Duck.gltf', { onProgress: (e) => this.onLoadProgress(e), onComplete: (e) => this.onComplete(e) })) as Object3D;
        Duck.scaleX = Duck.scaleY = Duck.scaleZ = 0.15;
        Duck.transform.y = 0;
        Duck.transform.x = 80;
        Duck.transform.z = 20;
        Duck.rotationX=0;
        Duck.rotationY=180;
        Duck.rotationZ=0;
        this.scene.addChild(Duck);


    }

    onLoadProgress(e) {
        console.log(e);
    }

    onComplete(e) {
        console.log(e);
    }

    renderUpdate() {

    }
}
new Sample_GI().run();
