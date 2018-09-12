
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'seed words',
    'https://rinkeby.infura.io/v3/token'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data : '0x' + compiledFactory.bytecode})
    .send({gas: '5000000', from : 'address'})
    .then((instance) => { 
        console.log("Contract mined at " + instance.options.address);
    });;

    console.log('Contract deployed successfully');
};

deploy();