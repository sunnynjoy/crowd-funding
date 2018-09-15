
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'transfer bean loan panic copy achieve wrong wave away pumpkin dial space',
    'https://rinkeby.infura.io/v3/c39f9c9e5aa4480ca5f77ece82afb4a3'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data : '0x' + compiledFactory.bytecode})
    .send({gas: '5000000', from : '0x2fd72bd1A59342F93aEb6F3e01f6bDb8783916e9'})
    .then((instance) => { 
        console.log("Contract mined at " + instance.options.address);
    });;

    console.log('Contract deployed successfully');
};

deploy();