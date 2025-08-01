import { GAME_HEIGHT, PLAYER_HEIGHT, PLAYER_WIDTH, TILE_SIZE } from "../const";

export default abstract class GameScene extends Phaser.Scene {
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(name: string) {
        super(name);
    }

    preload() {
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.load.image('ground', 'assets/ground_32.png');
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });

        this.loadAdditionalRessources();
    }

    setUpPlayerAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    create() {
        const staticGroup = this.physics.add.staticGroup();
        this.player = this.addPlayer();

        this.setUpPlayerAnimations();
        this.addStaticPlatforms(staticGroup);

        this.physics.add.collider(this.player, staticGroup);
    }

    placePlayer(row: number, column: number) {
        return this.physics.add.sprite(
            (column * TILE_SIZE) + (PLAYER_WIDTH / 2),
            GAME_HEIGHT - (row * TILE_SIZE) - (PLAYER_HEIGHT / 2),
            'player'
        );
    }

    abstract addStaticPlatforms(staticGroup: Phaser.Physics.Arcade.StaticGroup): void;

    abstract addPlayer(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    checkPlayerMovements() {
        if (!this.cursors || !this.player) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-375);
        }
    }

    update(): void {
        this.checkPlayerMovements();
        this.sceneLogic();
    }

    addPlatformBlock(
        group: Phaser.GameObjects.Group,
        startCol: number,
        endCol: number,
        startRow: number,
        endRow: number
    ) {
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                group.create(
                    (col * TILE_SIZE) + (TILE_SIZE / 2),
                    GAME_HEIGHT - (row * TILE_SIZE) - (TILE_SIZE / 2),
                    'ground'
                );
            }
        }
    }

    loadAdditionalRessources() {

    }

    sceneLogic() {

    }
}