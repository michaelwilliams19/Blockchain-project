//Googlear mas sobre spdx
// SPDX-License-Identifier: UNLICENSED

//version de solidity. Debe ser la misma que el archivo hardhat.config.js
pragma solidity ^0.8.4;

//hacer algunos registros de consola en el contrato. Es dificil depurar contratos y esto lo beneficia
//Me permite utilizar funciones de console.log() por ej
import "hardhat/console.sol";

contract WavePortal
{
    //unsigned integers -> solo representa valores positivos. 256 bits de tamaño como la EVM utiliza
    //es una variable de estado. va a estar permanentemente en el almacenamiento del contrato
    uint256 totalWaves;

    uint256 private seed;//para generar un numero aleatorio

    //googlear que eventos hay en solidity.
    event newWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver; //la direccion del usuario que saludo.
        string message; //mensaje del usuario que saludo.
        uint256 timestamp; //timestamp del usuario cuando saludo
    }
    
    Wave[] waves; //donde guardo todos los saludos que recibi.
    
    mapping(address => uint256) public lastWavedAt;


    // "payable" -> Debemos añadirlo en el constructor para que nuestro contrato permita realizar pagos a los demas.
    constructor() payable {
        console.log("Pasando por el constructor");

        seed = (block.timestamp + block.difficulty) % 100;
    }


    function wave(string memory _message) public 
    {
        require(lastWavedAt[msg.sender] + 30 seconds < block.timestamp, "Wait 30seconds");

        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log("%s waved w/ message %s!", msg.sender, _message); //msg.sender es la direccion de la wallet de la persona que llamo a la funcion.

        waves.push(Wave(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("random # generated: %d", seed);

        if (seed <= 50)
        {
            console.log("GANASTE %s", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
        
            require(prizeAmount <= address(this).balance, "trying to withdraw money from contract");
            
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit newWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns (Wave[] memory){
        return waves;
    }

    function getTotalWaves() public view returns (uint256)
    {
        console.log("We have %s total waves!", totalWaves);
        return totalWaves;
    }
}


