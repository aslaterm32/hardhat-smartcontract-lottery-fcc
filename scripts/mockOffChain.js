const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const raffle = await ethers.getContract("Raffle")
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await raffle.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        if (network.config.chainId == 31337) {
            console.log("Local network detected, launching mock VRF...")
            await mockVrf(requestId, raffle)
        }
        console.log(`Performed upkeep with requestId: ${requestId}`)
        // if (network.config.chainId == 31337) {
        //     console.log("Local network detected, launching mock VRF...")
        //     await mockVrf(requestId, raffle)
        // }
    } else {
        console.log("No upkeep needed")
    }
}

async function mockVrf(requestId, raffle) {
    console.log("Retrieving mock VRF contract...")
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    console.log("Success")
    console.log("Picking winner...")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.address)
    console.log("Success")
    const recentWinner = await raffle.getRecentWinner()
    console.log(`Recent winner: ${recentWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
