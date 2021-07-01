import * as THREE from "three";

export class GuardGeometry extends THREE.BufferGeometry {
    public constructor(height: number = 1) {
        super();

        let vertices: number[] = [];
        let indices: number[] = [];

        let hHalf = height / 2;
        let offsetUp = 0.25;

        // Bottom
        vertices.push(0.5, -hHalf, -1 + offsetUp);   // 0/A
        vertices.push(-0.5, -hHalf, -1 + offsetUp);  // 1/B
        vertices.push(0.5, -hHalf, offsetUp);        // 2/C
        vertices.push(-0.5, -hHalf, offsetUp);       // 3/D
        vertices.push(0, 0, 0.5 + offsetUp);         // 4/E

        indices.push(1, 0, 2);
        indices.push(1, 2, 3);
        indices.push(3, 2, 4);

        // Top
        vertices.push(0.5, hHalf, -1 + offsetUp);   // 5/F
        vertices.push(-0.5, hHalf, -1 + offsetUp);  // 6/G
        vertices.push(0.5, hHalf, offsetUp);        // 7/H
        vertices.push(-0.5, hHalf, offsetUp);       // 8/I

        indices.push(5, 6, 7);
        indices.push(7, 6, 8);
        indices.push(7, 8, 4);

        // Left
        indices.push(2, 0, 5);
        indices.push(2, 5, 7);
        indices.push(4, 2, 7);

        // Right
        indices.push(1, 3, 8);
        indices.push(1, 8, 6);
        indices.push(3, 4, 8);

        // Behind
        indices.push(0, 1, 6);
        indices.push(0, 6, 5);

        this.setIndex(indices);
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.computeVertexNormals();

        this.rotateY(Math.PI);

        this.computeBoundingSphere();
    }
}
