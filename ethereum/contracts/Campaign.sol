pragma solidity ^0.4.24;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minumum) public {
        address newCampiagn = new Campaign(minumum, msg.sender);
        deployedCampaigns.push(newCampiagn);
    }
    
    function getDeployedCampigns() public view returns (address[]) {
        return deployedCampaigns;
    } 
}

contract Campaign {
    
    struct Request{
        string description;
        uint value;
        address receipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    address private manager;
    uint private minumumContribution;
    uint approversCount;
    Request[] public requests;
    mapping(address => bool) public approvers;
    
    modifier newRequestValidation() {
        require(msg.sender == manager, "Only manager has the right to make a new Request");
        _;
    }
    
    constructor(uint minumum, address actualCreator) public {
        manager = actualCreator;
        minumumContribution = minumum;
    }
    
    function getManager() public view returns (address) {
        return manager;
    }
    
    function getMinumumContribution() public view returns (uint) {
        return minumumContribution;
    }
    
    function contribute() public payable {
        require(msg.value > minumumContribution, "Must be having more than minimum contribution");
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createNewRequest(string description, uint value, address receipient) public newRequestValidation {
        Request memory newRequest = Request({
            description: description,
            value: value,
            receipient: receipient,
            complete: false,
            approvalCount: 0
        });
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        require(approvers[msg.sender], "User must contribute to approve");
        require(!request.approvals[msg.sender], "Can't approve if it has been approved once");
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint index) public newRequestValidation {
        Request storage request = requests[index];
        require(!request.complete, "Must not Complete");
        require(request.approvalCount > (approversCount/2), " Approvals must be greater than 50% of approvers");
        
        request.receipient.transfer(request.value);
        request.complete = true;
    }
}