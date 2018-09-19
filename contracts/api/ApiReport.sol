pragma solidity ^0.4.24;

import "contracts/interface/ICouncil.sol";
import "contracts/interface/IReport.sol";

import "contracts/utils/ValidValue.sol";
import "contracts/utils/ExtendsOwnable.sol";
import "contracts/utils/BytesLib.sol";

contract ApiReport is ValidValue, ExtendsOwnable {
    using BytesLib for bytes;

    //위원회
    ICouncil council;

    constructor(address _councilAddress) public validAddress(_councilAddress) {
        council = ICouncil(_councilAddress);
    }

    //-------- 등록금 관련 --------

    /**
    * @dev 신고자가 맞긴 보증금을 찾아감
    */
    function withdrawRegistration() external {
        return IReport(council.getReport()).withdrawRegistration(msg.sender);
    }

    /**
    * @dev 신고자가 맞긴 신고 보증금 잔액과 잠금 기간, 블락 기간을 조회한다
    */
    function getRegistrationAmount() external view returns(uint256 amount, uint256 lockTime, uint256 blockTime) {
        return IReport(council.getReport()).getRegistrationAmount(msg.sender);
    }

    //-------- 신고 관련 --------

    /**
    * @dev 신고자가 어떤 작품에 대해 신고를 함
    * @param _content 신고 할 작품 주소
    * @param _detail 신고정보
    */
    function sendReport(address _content, string _detail) external validAddress(_content) {
        IReport(council.getReport()).sendReport(_content, msg.sender, _detail);
    }

    /**
    * @dev Report 목록의 신고를 처리함
    * @param _index Report의 reports 인덱스 값
    * @param _content Content의 주소
    * @param _reporter Reporter의 주소
    * @param _deductionRate 신고자의 RegFee를 차감시킬 비율, 0이면 Reward를 지급함, 50(논의)이상이면 block처리함
    */
    function judge(uint256 _index, address _content, address _reporter, uint256 _deductionRate)
        external
        validAddress(_content)
        validAddress(_reporter)
    {
        require(council.isMember(msg.sender));
        council.judge(_index, _content, _reporter, _deductionRate);
    }

    /**
    * @dev 신고 목록의 id 값으로 처리여부, 처리 결과, 토큰량을 회신한다
    * @param ids 신고 id 목록
    */
    function getReportResult(uint256[] ids)
        external
        view
        returns(bool[] memory complete_, bool[] memory completeValid_, uint256[] memory completeAmount_)
    {
        complete_ = new bool[](ids.length);
        completeValid_ = new bool[](ids.length);
        completeAmount_ = new uint256[](ids.length);

        for(uint i = 0; i < ids.length; i++) {
            (,,,complete_[i], completeValid_[i], completeAmount_[i]) = IReport(council.getReport()).getReport(ids[i]);
        }
    }
}
