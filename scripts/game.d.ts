/// <reference path="app.d.ts" />
declare module tanks {
    class World {
        static worldActive: boolean;
        static canvas: HTMLElement | HTMLCanvasElement;
        private static updatehandle;
        constructor(canvas?: HTMLElement | HTMLCanvasElement);
        static update(): void;
        static draw(): void;
        static kill(): void;
    }
}
