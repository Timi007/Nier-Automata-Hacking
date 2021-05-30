import * as THREE from "three";

export class PlayerGeometry extends THREE.BufferGeometry {
    public constructor(height: number = 0.25) {
        super();

        let vertices: number[] = [];
        let indices: number[] = [];

        let hHalf = height / 2;
        let offsetDown = 0.25;

        // Bottom
        vertices.push(0, -hHalf, 1 - offsetDown);       // Front    0/A
        vertices.push(-0.5, -hHalf, 0 - offsetDown);    // Left     1/B
        vertices.push(0.5, -hHalf, 0 - offsetDown);     // Right    2/C
        vertices.push(0, -hHalf, -0.5 - offsetDown);    // Aft      3/D

        // left, right, top
        indices.push(1, 2, 0);
        indices.push(1, 3, 2);

        // Top
        vertices.push(0, hHalf, 1 - offsetDown);        // Front    4/E
        vertices.push(-0.5, hHalf, 0 - offsetDown);     // Left     5/F
        vertices.push(0.5, hHalf, 0 - offsetDown);      // Right    6/G
        vertices.push(0, hHalf, -0.5 - offsetDown);     // Aft      7/H

        indices.push(6, 5, 4);
        indices.push(6, 7, 5);

        // Left
        // Top left
        indices.push(0, 2, 4);
        indices.push(4, 2, 6);

        // Bottom left
        indices.push(2, 3, 6);
        indices.push(6, 3, 7);

        // Right
        // Top right
        indices.push(4, 5, 1);
        indices.push(0, 4, 1);

        // Bottom right
        indices.push(5, 7, 1);
        indices.push(1, 7, 3);

        this.setIndex(indices);
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.computeVertexNormals();

        this.rotateY(Math.PI);

        this.computeBoundingSphere();
    }
}
