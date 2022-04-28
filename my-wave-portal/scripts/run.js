//hre.ethers nunca es importado porque proviene directamente de los docs de hardhat.
//Es un objeto que contiene todas las funcionalidades que hardhat expone cuando ejecuta una tarea, prueba o script. 
//Es decir, HRE = Hardhat.
//Cada vez que se ejecuta un comando que comienza con npx hardhat, uno obtiene un objeto "HRE" construido sobre la marcha usando lo de hardhat.config.js
//que esta especificado en el codigo. Por ende, nunca debo hacer algun tipo de importacion en mis archivos para hre.
const main = async () => {
    //Compila el contrato y genera los archivos necesarios para trabajar con el mismo en el directorio "artifacts"
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");

    //crea una red Ethereum local solo para este contrato. Cuando se completa el script, destruye esta red local. 
    //Por ende, cada vez que se ejecuta el contrato sera sobre una blockchain nueva. 
    const waveContract = await waveContractFactory.deploy({ value: hre.ethers.utils.parseEther("0.1"),});
    //hre.ethers.utils.parseEther("0.1") -> le estamos diciendo que despliegue el contrato con 0.1 eth de financia. Esto me lo descuenta de mi billetera.


    //Esperamos hasta que el contracto este implementado oficialmente en la blockchain local. 
    //El constructor del contrato se ejecuta recien cuando se implementa.
    await waveContract.deployed();

    console.log("Contract deployed to: ", waveContract.address);

    // console.log("Contract deployed by: ", owner.address);

    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance)); //para saber si mi contrato realmente tiene el eth inicial de 0.1

    let waveTxn = await waveContract.wave("Saludo #1");
    await waveTxn.wait();

    let waveTxn2 = await waveContract.wave("Saludo #2");
    await waveTxn2.wait();

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance));
    

    // let waveCount;
    // waveCount = await waveContract.getTotalWaves();
    // console.log(waveCount.toNumber());

    // let waveTxn = await waveContract.wave("Un mensaje");
    // await waveTxn.wait();

    // // waveCount = await waveContract.getTotalWaves();
    // const [_, randomPerson] = await hre.ethers.getSigners();
    // waveTxn = await waveContract.connect(randomPerson).wave("otro mensaje");
    // await waveTxn.wait();

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);
    // waveCount = await waveContract.getTotalWaves();
};

const runMain = async () => {
    try
    {
        await main();
        process.exit(0); //codigo de exito
    } 
    catch (error)
    {
        console.log(error);
        process.exit(1); //codigo de excepcion no atrapada ni manejada por el dominio.
    }
};

runMain();