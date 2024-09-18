 - **H-1 : Incorrect comparison implementation**
   Use `require` or `if` to compare values. Otherwise comparison will be ignored.

 - **H-2 : Using `delegatecall` inside a loop**
   When calling `delegatecall` the same `msg.value` amount will be accredited multiple times.

 - **H-3 : `get_dy_underlying()` is not a flash-loan-resistant price**
   `get_dy_underlying()` calculates the price based on the contract's underlying reserves, which can be manipulated by sandwiching the call with a flash loan. Therefore, using its output as a price oracle is not safe and will lead to loss of funds. Use a Chainlink oracle instead.

 - **H-4 : Using `msg.value` in a loop**
   This is a classic dangerous pattern

 - **H-5 : `wstETH`'s functions operate on units of stEth, not Eth**
   `wstETH`'s functions return values related to [units of stEth](https://docs.lido.fi/contracts/wsteth/#view-methods), not units of Eth. Even after the Shanghai upgrade, the price of stETH is [not the same](https://coinmarketcap.com/currencies/steth/steth/eth/) as the prices of ETH

 - **M-1 : Contracts are vulnerable to fee-on-transfer and rebasing accounting-related issues**
   Consistently check account balance before and after transfers for Fee-On-Transfer discrepancies. As arbitrary ERC20 tokens can be used, the amount here should be calculated every time to take into consideration a possible fee-on-transfer or deflation.
   Also, it's a good practice for the future of the solution.
   
   Use the balance before and after the transfer to calculate the received amount instead of assuming that it would be equal to the amount passed as a parameter. Or explicitly document that such tokens shouldn't be used and won't be supported

 - **M-2 : `block.number` means different things on different L2s**
   On Optimism, `block.number` is the L2 block number, but on Arbitrum, it's the L1 block number, and `ArbSys(address(100)).arbBlockNumber()` must be used. Furthermore, L2 block numbers often occur much more frequently than L1 block numbers (any may even occur on a per-transaction basis), so using block numbers for timing results in inconsistencies, especially when voting is involved across multiple chains. As of version 4.9, OpenZeppelin has [modified](https://blog.openzeppelin.com/introducing-openzeppelin-contracts-v4.9#governor) their governor code to use a clock rather than block numbers, to avoid these sorts of issues, but this still requires that the project [implement](https://docs.openzeppelin.com/contracts/4.x/governance#token_2) a [clock](https://eips.ethereum.org/EIPS/eip-6372) for each L2.

 - **M-3 : Centralization Risk for trusted owners**
   Contracts have owners with privileged rights to perform admin tasks and need to be trusted to not perform malicious updates or drain funds.

 - **M-4 : Use of deprecated chainlink function: `latestAnswer()`**
   According to Chainlink’s documentation [(API Reference)](https://docs.chain.link/data-feeds/api-reference#latestanswer), the latestAnswer function is deprecated. This function does not throw an error if no answer has been reached, but instead returns 0, possibly causing an incorrect price to be fed to the different price feeds or even a Denial of Service.

 - **M-5 : `call()` should be used instead of `transfer()` on an `address payable`**
   The use of the deprecated `transfer()` function for an address may make the transaction fail due to the 2300 gas stipend

 - **M-6 : `_safeMint()` should be used rather than `_mint()` wherever possible**
   `_mint()` is [discouraged](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/d4d8d2ed9798cc3383912a23b5e8d5cb602f7d4b/contracts/token/ERC721/ERC721.sol#L271) in favor of `_safeMint()` which ensures that the recipient is either an EOA or implements `IERC721Receiver`. Both open [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/d4d8d2ed9798cc3383912a23b5e8d5cb602f7d4b/contracts/token/ERC721/ERC721.sol#L238-L250) and [solmate](https://github.com/Rari-Capital/solmate/blob/4eaf6b68202e36f67cab379768ac6be304c8ebde/src/tokens/ERC721.sol#L180) have versions of this function so that NFTs aren't lost if they're minted to contracts that cannot transfer them back out.
   
   Be careful however to respect the CEI pattern or add a re-entrancy guard as `_safeMint` adds a callback-check (`_checkOnERC721Received`) and a malicious `onERC721Received` could be exploited if not careful.
   
   Reading material:
   
   - <https://blocksecteam.medium.com/when-safemint-becomes-unsafe-lessons-from-the-hypebears-security-incident-2965209bda2a>
   - <https://samczsun.com/the-dangers-of-surprising-code/>
   - <https://github.com/KadenZipfel/smart-contract-attack-vectors/blob/master/vulnerabilities/unprotected-callback.md>

 - **M-7 : Using `transferFrom` on ERC721 tokens**
   The `transferFrom` function is used instead of `safeTransferFrom` and [it's discouraged by OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/109778c17c7020618ea4e035efb9f0f9b82d43ca/contracts/token/ERC721/IERC721.sol#L84). If the arbitrary address is a contract and is not aware of the incoming ERC721 token, the sent token could be locked.

 - **M-8 : Fees can be set to be greater than 100%.**
   There should be an upper limit to reasonable fees.
   A malicious owner can keep the fee rate at zero, but if a large value transfer enters the mempool, the owner can jack the rate up to the maximum and sandwich attack a user.

 - **M-9 : `increaseAllowance/decreaseAllowance` won't work on mainnet for USDT**
   On mainnet, the mitigation to be compatible with `increaseAllowance/decreaseAllowance` isn't applied: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7#code, meaning it reverts on setting a non-zero & non-max allowance, unless the allowance is already zero.

 - **M-10 : Lack of EIP-712 compliance: using `keccak256()` directly on an array or struct variable**
   Directly using the actual variable instead of encoding the array values goes against the EIP-712 specification https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-encodedata. 
   **Note**: OpenSea's [Seaport's example with offerHashes and considerationHashes](https://github.com/ProjectOpenSea/seaport/blob/a62c2f8f484784735025d7b03ccb37865bc39e5a/reference/lib/ReferenceGettersAndDerivers.sol#L130-L131) can be used as a reference to understand how array of structs should be encoded.

 - **M-11 : Library function isn't `internal` or `private`**
   In a library, using an external or public visibility means that we won't be going through the library with a DELEGATECALL but with a CALL. This changes the context and should be done carefully.

 - **M-12 : Function uses `call{value}` but does not have the `payable` modifier**
   The function uses msg.value indirectly through a `call{value}`, but does not have the payable modifier, which is required for any function that handles ether transfers.

 - **M-13 : Used selfdestruct**
   Any contract that depends on another smart contract must account for the fact that the other can vanish at any time. Moreover, the SELFDESTRUCT opcode is deprecated and is recommended to no longer be used.

 - **M-14 : Lack of slippage validation can lead to user loss of funds**
   The slippage parameter should be validated against its denominator in order to prevent user mistake and potential loss of funds.

 - **M-15 : Solady's SafeTransferLib does not check for token contract's existence**
   There is a subtle difference between the implementation of solady’s SafeTransferLib and OZ’s SafeERC20: OZ’s SafeERC20 checks if the token is a contract or not, solady’s SafeTransferLib does not.
   https://github.com/Vectorized/solady/blob/main/src/utils/SafeTransferLib.sol#L10 
   `@dev Note that none of the functions in this library check that a token has code at all! That responsibility is delegated to the caller` 
   

 - **M-16 :  Solmate's SafeTransferLib does not check for token contract's existence**
   There is a subtle difference between the implementation of solmate’s SafeTransferLib and OZ’s SafeERC20: OZ’s SafeERC20 checks if the token is a contract or not, solmate’s SafeTransferLib does not.
   https://github.com/transmissions11/solmate/blob/main/src/utils/SafeTransferLib.sol#L9 
   `@dev Note that none of the functions in this library check that a token has code at all! That responsibility is delegated to the caller` 
   

 - **M-17 : Chainlink's `latestRoundData` might return stale or incorrect results**
   - This is a common issue: https://github.com/code-423n4/2022-12-tigris-findings/issues/655, https://code4rena.com/reports/2022-10-inverse#m-17-chainlink-oracle-data-feed-is-not-sufficiently-validated-and-can-return-stale-price, https://app.sherlock.xyz/audits/contests/41#issue-m-12-chainlinks-latestrounddata--return-stale-or-incorrect-result and many more occurrences.
   
   `latestRoundData()` is used to fetch the asset price from a Chainlink aggregator, but it's missing additional validations to ensure that the round is complete. If there is a problem with Chainlink starting a new round and finding consensus on the new value for the oracle (e.g. Chainlink nodes abandon the oracle, chain congestion, vulnerability/attacks on the Chainlink system) consumers of this contract may continue using outdated stale data / stale prices.
   
   More bugs related to chainlink here: [Chainlink Oracle Security Considerations](https://medium.com/cyfrin/chainlink-oracle-defi-attacks-93b6cb6541bf#99af)

 - **M-18 : Missing checks for whether the L2 Sequencer is active**
   Chainlink recommends that users using price oracles, check whether the Arbitrum Sequencer is [active](https://docs.chain.link/data-feeds/l2-sequencer-feeds#arbitrum). If the sequencer goes down, the Chainlink oracles will have stale prices from before the downtime, until a new L2 OCR transaction goes through. Users who submit their transactions via the [L1 Dealyed Inbox](https://developer.arbitrum.io/tx-lifecycle#1b--or-from-l1-via-the-delayed-inbox) will be able to take advantage of these stale prices. Use a [Chainlink oracle](https://blog.chain.link/how-to-use-chainlink-price-feeds-on-arbitrum/#almost_done!_meet_the_l2_sequencer_health_flag) to determine whether the sequencer is offline or not, and don't allow operations to take place while the sequencer is offline.

 - **M-19 : Direct `supportsInterface()` calls may cause caller to revert**
   Calling `supportsInterface()` on a contract that doesn't implement the ERC-165 standard will result in the call reverting. Even if the caller does support the function, the contract may be malicious and consume all of the transaction's available gas. Call it via a low-level [staticcall()](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f959d7e4e6ee0b022b41e5b644c79369869d8411/contracts/utils/introspection/ERC165Checker.sol#L119), with a fixed amount of gas, and check the return code, or use OpenZeppelin's [`ERC165Checker.supportsInterface()`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f959d7e4e6ee0b022b41e5b644c79369869d8411/contracts/utils/introspection/ERC165Checker.sol#L36-L39).

 - **M-20 : Contract is not compliant with ERC-165**
   In order to properly implement `supportsInterface` in accordance with the ERC-165, the function MUST return true for the interface ID parameter `0x01ffc9a7` (calculated from `bytes4(keccak256("supportsInterface(bytes4)"))`), or simply `type(ERC165).interfaceId`.

 - **M-21 : Suspicious Self Assignment**
   A self-assignment occurs when a variable or state is assigned a value that is already held by that variable or state itself. This situation often indicates a potential issue in the code, which can be redundant or incorrect. Specifically, self-assignment might suggest that the value assignment does not change the state of the variable, or it could be a sign of a logical error.

 - **M-22 : Call.value fallback function reversion risk**
   Make sure the return boolean of the call function with value is true, otherwise contract risks assuming value has left when not if the fallback function of the destination reverts or is not payable.

 - **M-23 : Return values of `transfer()`/`transferFrom()` not checked**
   Not all `IERC20` implementations `revert()` when there's a failure in `transfer()`/`transferFrom()`. The function signature has a `boolean` return value and they indicate errors that way instead. By not checking the return value, operations that should have marked as failed, may potentially go through without actually making a payment

 - **M-24 : Send fallback function reversion risk**
   Make sure the return boolean of the send function is true, otherwise contract risks assuming value has left when not, if the fallback function of the destination reverts or is not payable.

 - **M-25 : Unsafe use of `transfer()`/`transferFrom()` with `IERC20`**
   Some tokens do not implement the ERC20 standard properly but are still accepted by most code that accepts ERC20 tokens.  For example Tether (USDT)'s `transfer()` and `transferFrom()` functions on L1 do not return booleans as the specification requires, and instead have no return value. When these sorts of tokens are cast to `IERC20`, their [function signatures](https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca) do not match and therefore the calls made, revert (see [this](https://gist.github.com/IllIllI000/2b00a32e8f0559e8f386ea4f1800abc5) link for a test case). Use OpenZeppelin's `SafeERC20`'s `safeTransfer()`/`safeTransferFrom()` instead

 - **M-26 : Timestamp Manipulation**
   On proof-of-work chains, miners can change the block timestamp. If critical operations depend upon these timestamps, or they are meant to be used as a source of pseudro-randmoness, they may be unsafe to use on PoW chains.

 - **L-1 : NFT contract redefines `_mint()`/`_safeMint()`, but not both**
   If one of the functions is re-implemented, or has new arguments, the other should be as well. The `_mint()` variant is supposed to skip `onERC721Received()` checks, whereas `_safeMint()` does not. Not having both points to a possible issue with spec-compatibility.

 - **L-2 : `approve()`/`safeApprove()` may revert if the current approval is not zero**
   - Some tokens (like the *very popular* USDT) do not work when changing the allowance from an existing non-zero allowance value (it will revert if the current approval is not zero to protect against front-running changes of approvals). These tokens must first be approved for zero and then the actual allowance can be approved.
   - Furthermore, OZ's implementation of safeApprove would throw an error if an approve is attempted from a non-zero value (`"SafeERC20: approve from non-zero to non-zero allowance"`)
   
   Set the allowance to zero immediately before each of the existing allowance calls

 - **L-3 : Use of `tx.origin` is unsafe in almost every context**
   According to [Vitalik Buterin](https://ethereum.stackexchange.com/questions/196/how-do-i-make-my-dapp-serenity-proof), contracts should _not_ `assume that tx.origin will continue to be usable or meaningful`. An example of this is [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074#allowing-txorigin-as-signer-1) which explicitly mentions the intention to change its semantics when it's used with new op codes. There have also been calls to [remove](https://github.com/ethereum/solidity/issues/683) `tx.origin`, and there are [security issues](solidity.readthedocs.io/en/v0.4.24/security-considerations.html#tx-origin) associated with using it for authorization. For these reasons, it's best to completely avoid the feature.

 - **L-4 : Use a 2-step ownership transfer pattern**
   Recommend considering implementing a two step process where the owner or admin nominates an account and the nominated account needs to call an `acceptOwnership()` function for the transfer of ownership to fully succeed. This ensures the nominated EOA account is a valid and active account. Lack of two-step procedure for critical operations leaves them error-prone. Consider adding two step procedure on the critical functions.

 - **L-5 : Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator.**
   Division by large numbers may result in the result being zero, due to Solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator.

 - **L-6 : Precision Loss due to Division before Multiplication**
   division operations can lead to a loss of precision as the fractional part is discarded. When the result of such a division operation is then multiplied, this loss of precision can be magnified, potentially leading to significant inaccuracies in the calculations.

 - **L-7 : NFT doesn't handle hard forks**
   When there are hard forks, users often have to go through [many hoops](https://twitter.com/elerium115/status/1558471934924431363) to ensure that they control ownership on every fork. Consider adding `require(1 == chain.chainId)`, or the chain ID of whichever chain you prefer, to the functions below, or at least include the chain ID in the URI, so that there is no confusion about which chain is the owner of the NFT.

 - **L-8 : Some tokens may revert when zero value transfers are made**
   Example: https://github.com/d-xo/weird-erc20#revert-on-zero-value-transfers.
   
   In spite of the fact that EIP-20 [states](https://github.com/ethereum/EIPs/blob/46b9b698815abbfa628cd1097311deee77dd45c5/EIPS/eip-20.md?plain=1#L116) that zero-valued transfers must be accepted, some tokens, such as LEND will revert if this is attempted, which may cause transactions that involve other tokens (such as batch operations) to fully revert. Consider skipping the transfer if the amount is zero, which will also save gas.

 - **L-9 : Missing checks for `address(0)` when assigning values to address state variables**

 - **L-10 : Use of `ecrecover` is susceptible to signature malleability**
   The built-in EVM precompile `ecrecover` is susceptible to signature malleability, which could lead to replay attacks.
   References:  <https://swcregistry.io/docs/SWC-117>,  <https://swcregistry.io/docs/SWC-121>, and  <https://medium.com/cryptronics/signature-replay-vulnerabilities-in-smart-contracts-3b6f7596df57>.
   While this is not immediately exploitable, this may become a vulnerability if used elsewhere.

 - **L-11 : `abi.encodePacked()` should not be used with dynamic types when passing the result to a hash function such as `keccak256()`**
   Use `abi.encode()` instead which will pad items to 32 bytes, which will [prevent hash collisions](https://docs.soliditylang.org/en/v0.8.13/abi-spec.html#non-standard-packed-mode) (e.g. `abi.encodePacked(0x123,0x456)` => `0x123456` => `abi.encodePacked(0x1,0x23456)`, but `abi.encode(0x123,0x456)` => `0x0...1230...456`). "Unless there is a compelling reason, `abi.encode` should be preferred". If there is only one argument to `abi.encodePacked()` it can often be cast to `bytes()` or `bytes32()` [instead](https://ethereum.stackexchange.com/questions/30912/how-to-compare-strings-in-solidity#answer-82739).
   If all arguments are strings and or bytes, `bytes.concat()` should be used instead

 - **L-12 : Use of `tx.origin` is unsafe in almost every context**
   According to [Vitalik Buterin](https://ethereum.stackexchange.com/questions/196/how-do-i-make-my-dapp-serenity-proof), contracts should _not_ `assume that tx.origin will continue to be usable or meaningful`. An example of this is [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074#allowing-txorigin-as-signer-1) which explicitly mentions the intention to change its semantics when it's used with new op codes. There have also been calls to [remove](https://github.com/ethereum/solidity/issues/683) `tx.origin`, and there are [security issues](solidity.readthedocs.io/en/v0.4.24/security-considerations.html#tx-origin) associated with using it for authorization. For these reasons, it's best to completely avoid the feature.

 - **L-13 : `calc_token_amount()` has slippage added on top of Curve's calculated slippage**
   According to the Curve [docs](https://curve.readthedocs.io/_/downloads/en/latest/pdf/), `StableSwap.calc_token_amount()` already includes slippage but not fees, so adding extra slippage on top of the returned result, as is done by the caller of functions higher up the caller chain, is an incorrect operation.

 - **L-14 : `decimals()` is not a part of the ERC-20 standard**
   The `decimals()` function is not a part of the [ERC-20 standard](https://eips.ethereum.org/EIPS/eip-20), and was added later as an [optional extension](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Metadata.sol). As such, some valid ERC20 tokens do not support this interface, so it is unsafe to blindly cast all tokens to this interface, and then call this function.

 - **L-15 : `decimals()` should be of type `uint8`**

 - **L-16 : Deprecated approve() function**
   Due to the inheritance of ERC20's approve function, there's a vulnerability to the ERC20 approve and double spend front running attack. Briefly, an authorized spender could spend both allowances by front running an allowance-changing transaction. Consider implementing OpenZeppelin's `.safeApprove()` function to help mitigate this.

 - **L-17 : Do not use deprecated library functions**

 - **L-18 : `safeApprove()` is deprecated**
   [Deprecated](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/bfff03c0d2a59bcd8e2ead1da9aed9edf0080d05/contracts/token/ERC20/utils/SafeERC20.sol#L38-L45) in favor of `safeIncreaseAllowance()` and `safeDecreaseAllowance()`. If only setting the initial allowance to the value that means infinite, `safeIncreaseAllowance()` can be used instead. The function may currently work, but if a bug is found in this version of OpenZeppelin, and the version that you're forced to upgrade to no longer has this function, you'll encounter unnecessary delays in porting and testing replacement contracts.

 - **L-19 : Deprecated _setupRole() function**

 - **L-20 : Do not leave an implementation contract uninitialized**
   An uninitialized implementation contract can be taken over by an attacker, which may impact the proxy. To prevent the implementation contract from being used, it's advisable to invoke the `_disableInitializers` function in the constructor to automatically lock it when it is deployed. This should look similar to this:
   ```solidity
     /// @custom:oz-upgrades-unsafe-allow constructor
     constructor() {
         _disableInitializers();
     }
   ```
   
   Sources:
   - https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable-_disableInitializers--
   - https://twitter.com/0xCygaar/status/1621417995905167360?s=20

 - **L-21 : Division by zero not prevented**
   The divisions below take an input parameter which does not have any zero-value checks, which may lead to the functions reverting when zero is passed.

 - **L-22 : `domainSeparator()` isn't protected against replay attacks in case of a future chain split **
   Severity: Low.
   Description: See <https://eips.ethereum.org/EIPS/eip-2612#security-considerations>.
   Remediation: Consider using the [implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/EIP712.sol#L77-L90) from OpenZeppelin, which recalculates the domain separator if the current `block.chainid` is not the cached chain ID.
   Past occurrences of this issue:
   - [Reality Cards Contest](https://github.com/code-423n4/2021-06-realitycards-findings/issues/166)
   - [Swivel Contest](https://github.com/code-423n4/2021-09-swivel-findings/issues/98)
   - [Malt Finance Contest](https://github.com/code-423n4/2021-11-malt-findings/issues/349)

 - **L-23 : Duplicate import statements**

 - **L-24 : Empty Function Body - Consider commenting why**

 - **L-25 : Empty `receive()/payable fallback()` function does not authenticate requests**
   If the intention is for the Ether to be used, the function should call another function, otherwise it should revert (e.g. require(msg.sender == address(weth))). Having no access control on the function means that someone may send Ether to the contract, and have no way to get anything back out, which is a loss of funds. If the concern is having to spend a small amount of gas to check the sender against an immutable address, the code should at least have a function to rescue unused Ether.

 - **L-26 : External calls in an un-bounded `for-`loop may result in a DOS**
   Consider limiting the number of iterations in for-loops that make external calls

 - **L-27 : External call recipient may consume all transaction gas**
   There is no limit specified on the amount of gas used, so the recipient can use up all of the transaction's gas, causing it to revert. Use `addr.call{gas: <amount>}("")` or [this](https://github.com/nomad-xyz/ExcessivelySafeCall) library instead.

 - **L-28 : Fallback lacking `payable`**

 - **L-29 : Initializers could be front-run**
   Initializers could be front-run, allowing an attacker to either set their own values, take ownership of the contract, and in the best case forcing a re-deployment

 - **L-30 : Signature use at deadlines should be allowed**
   According to [EIP-2612](https://github.com/ethereum/EIPs/blob/71dc97318013bf2ac572ab63fab530ac9ef419ca/EIPS/eip-2612.md?plain=1#L58), signatures used on exactly the deadline timestamp are supposed to be allowed. While the signature may or may not be used for the exact EIP-2612 use case (transfer approvals), for consistency's sake, all deadlines should follow this semantic. If the timestamp is an expiration rather than a deadline, consider whether it makes more sense to include the expiration timestamp as a valid timestamp, as is done for deadlines.

 - **L-31 : Lack of Slippage check**

 - **L-32 :  Low Level Calls to Custom Addresses**
   Contracts should avoid making low-level calls to custom addresses, especially if these calls are based on address parameters in the function. Such behavior can lead to unexpected execution of untrusted code. Instead, consider using Solidity's high-level function calls or contract interactions.

 - **L-33 : `Math.max(<x>,0)` used with `int` cast to `uint`**
   The code casts an `int` to a `uint` before passing it to `Math.max()`. It seems as though the `Math.max()` call is attempting to prevent values from being negative, but since the `int` is being cast to `uint`, the value will never be negative, and instead will overflow if either the multiplication involving the slope and timestamp is positive. I wasn't able to find a scenario where this is the case, but this seems very dangerous, and the `Math.max()` call is sending misleading signals, so I suggest moving it to inside the cast to `uint`

 - **L-34 : Prevent accidentally burning tokens**
   Minting and burning tokens to address(0) prevention

 - **L-35 : NFT ownership doesn't support hard forks**
   To ensure clarity regarding the ownership of the NFT on a specific chain, it is recommended to add `require(block.chainid == 1, "Invalid Chain")` or the desired chain ID in the functions below.
   
   Alternatively, consider including the chain ID in the URI itself. By doing so, any confusion regarding the chain responsible for owning the NFT will be eliminated.

 - **L-36 : Owner can renounce while system is paused**
   The contract owner or single user with a role is not prevented from renouncing the role/ownership while the contract is paused, which would cause any user assets stored in the protocol, to be locked indefinitely.

 - **L-37 : Possible rounding issue**
   Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator. Also, there is indication of multiplication and division without the use of parenthesis which could result in issues.

 - **L-38 : `pragma experimental ABIEncoderV2` is deprecated**
   Use `pragma abicoder v2` [instead](https://github.com/ethereum/solidity/blob/69411436139acf5dbcfc5828446f18b9fcfee32c/docs/080-breaking-changes.rst#silent-changes-of-the-semantics)

 - **L-39 : Loss of precision**
   Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator

 - **L-40 : Solidity version 0.8.20+ may not work on other chains due to `PUSH0`**
   The compiler for Solidity 0.8.20 switches the default target EVM version to [Shanghai](https://blog.soliditylang.org/2023/05/10/solidity-0.8.20-release-announcement/#important-note), which includes the new `PUSH0` op code. This op code may not yet be implemented on all L2s, so deployment on these chains will fail. To work around this issue, use an earlier [EVM](https://docs.soliditylang.org/en/v0.8.20/using-the-compiler.html?ref=zaryabs.com#setting-the-evm-version-to-target) [version](https://book.getfoundry.sh/reference/config/solidity-compiler#evm_version). While the project itself may or may not compile with 0.8.20, other projects with which it integrates, or which extend this project may, and those projects will have problems deploying these contracts/libraries.

 - **L-41 : Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership`**
   Use [Ownable2Step.transferOwnership](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol) which is safer. Use it as it is more secure due to 2-stage ownership transfer.
   
   **Recommended Mitigation Steps**
   
   Use <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol">Ownable2Step.sol</a>
     
     ```solidity
         function acceptOwnership() external {
             address sender = _msgSender();
             require(pendingOwner() == sender, "Ownable2Step: caller is not the new owner");
             _transferOwnership(sender);
         }
   ```

 - **L-42 : File allows a version of solidity that is susceptible to an assembly optimizer bug**
   In solidity versions 0.8.13 and 0.8.14, there is an [optimizer bug](https://github.com/ethereum/solidity-blog/blob/499ab8abc19391be7b7b34f88953a067029a5b45/_posts/2022-06-15-inline-assembly-memory-side-effects-bug.md) where, if the use of a variable is in a separate `assembly` block from the block in which it was stored, the `mstore` operation is optimized out, leading to uninitialized memory. The code currently does not have such a pattern of execution, but it does use `mstore`s in `assembly` blocks, so it is a risk for future changes. The affected solidity versions should be avoided if at all possible.

 - **L-43 : Sweeping may break accounting if tokens with multiple addresses are used**
   There have been [cases](https://blog.openzeppelin.com/compound-tusd-integration-issue-retrospective/) in the past where a token mistakenly had two addresses that could control its balance, and transfers using one address impacted the balance of the other. To protect against this potential scenario, sweep functions should ensure that the balance of the non-sweepable token does not change after the transfer of the swept tokens.

 - **L-44 : `symbol()` is not a part of the ERC-20 standard**
   The `symbol()` function is not a part of the [ERC-20 standard](https://eips.ethereum.org/EIPS/eip-20), and was added later as an [optional extension](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Metadata.sol). As such, some valid ERC20 tokens do not support this interface, so it is unsafe to blindly cast all tokens to this interface, and then call this function.

 - **L-45 : Consider using OpenZeppelin's SafeCast library to prevent unexpected overflows when downcasting**
   Downcasting from `uint256`/`int256` in Solidity does not revert on overflow. This can result in undesired exploitation or bugs, since developers usually assume that overflows raise errors. [OpenZeppelin's SafeCast library](https://docs.openzeppelin.com/contracts/3.x/api/utils#SafeCast) restores this intuition by reverting the transaction when such an operation overflows. Using this library eliminates an entire class of bugs, so it's recommended to use it always. Some exceptions are acceptable like with the classic `uint256(uint160(address(variable)))`

 - **L-46 : Unsafe ERC20 operation(s)**

 - **L-47 : Unsafe solidity low-level call can cause gas grief attack**
   Using the low-level calls of a solidity address can leave the contract open to gas grief attacks. These attacks occur when the called contract returns a large amount of data.
   
   So when calling an external contract, it is necessary to check the length of the return data before reading/copying it (using `returndatasize()`).

 - **L-48 : Unspecific compiler version pragma**

 - **L-49 : Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions**
   See [this](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps) link for a description of this storage variable. While some contracts may not currently be sub-classed, adding the variable now protects against forgetting to add it in the future.

 - **L-50 : Upgradeable contract not initialized**
   Upgradeable contracts are initialized via an initializer function rather than by a constructor. Leaving such a contract uninitialized may lead to it being taken over by a malicious user

 - **L-51 : Use of ecrecover is susceptible to signature malleability**
   The built-in EVM precompile ecrecover is susceptible to signature malleability, which could lead to replay attacks.Consider using OpenZeppelin’s ECDSA library instead of the built-in function.

 - **L-52 : Use `initializer` for public-facing functions only. Replace with `onlyInitializing` on internal functions.**
   See [What's the difference between onlyInitializing and initializer](https://forum.openzeppelin.com/t/whats-the-difference-between-onlyinitializing-and-initialzer/25789) and https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable-onlyInitializing--

 - **L-53 : A year is not always 365 days**
   On leap years, the number of days is 366, so calculations during those years will return the wrong value

 - **GAS-1 : Use ERC721A instead ERC721**
   ERC721A standard, ERC721A is an improvement standard for ERC721 tokens. It was proposed by the Azuki team and used for developing their NFT collection. Compared with ERC721, ERC721A is a more gas-efficient standard to mint a lot of of NFTs simultaneously. It allows developers to mint multiple NFTs at the same gas price. This has been a great improvement due to Ethereum's sky-rocketing gas fee.
   
       Reference: https://nextrope.com/erc721-vs-erc721a-2/

 - **GAS-2 : Don't use `_msgSender()` if not supporting EIP-2771**
   Use `msg.sender` if the code does not implement [EIP-2771 trusted forwarder](https://eips.ethereum.org/EIPS/eip-2771) support

 - **GAS-3 : `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings)**
   This saves **16 gas per instance.**

 - **GAS-4 : Use assembly to check for `address(0)`**
   *Saves 6 gas per instance*

 - **GAS-5 : `array[index] += amount` is cheaper than `array[index] = array[index] + amount` (or related variants)**
   When updating a value in an array with arithmetic, using `array[index] += amount` is cheaper than `array[index] = array[index] + amount`.
   
   This is because you avoid an additional `mload` when the array is stored in memory, and an `sload` when the array is stored in storage.
   
   This can be applied for any arithmetic operation including `+=`, `-=`,`/=`,`*=`,`^=`,`&=`, `%=`, `<<=`,`>>=`, and `>>>=`.
   
   This optimization can be particularly significant if the pattern occurs during a loop.
   
   *Saves 28 gas for a storage array, 38 for a memory array*

 - **GAS-6 : Comparing to a Boolean constant**
   Comparing to a constant (`true` or `false`) is a bit more expensive than directly checking the returned boolean value.
   
   Consider using `if(directValue)` instead of `if(directValue == true)` and `if(!directValue)` instead of `if(directValue == false)`

 - **GAS-7 : Using bools for storage incurs overhead**
   Use uint256(1) and uint256(2) for true/false to avoid a Gwarmaccess (100 gas), and to avoid Gsset (20000 gas) when changing from ‘false’ to ‘true’, after having been ‘true’ in the past. See [source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/58f635312aa21f947cae5f8578638a85aa2519f5/contracts/security/ReentrancyGuard.sol#L23-L27).

 - **GAS-8 : Bytes constants are more efficient than string constants**

 - **GAS-9 : Cache array length outside of loop**
   If not cached, the solidity compiler will always read the length of the array during each iteration. That is, if it is a storage array, this is an extra sload operation (100 additional extra gas for each iteration except for the first) and if it is a memory array, this is an extra mload operation (3 additional gas for each iteration except for the first).

 - **GAS-10 : State variables should be cached in stack variables rather than re-reading them from storage**
   The instances below point to the second+ access of a state variable within a function. Caching of a state variable replaces each Gwarmaccess (100 gas) with a much cheaper stack read. Other less obvious fixes/optimizations include having local memory caches of state variable structs, or having local caches of state variable contracts/addresses.
   
   *Saves 100 gas per instance*

 - **GAS-11 : Use calldata instead of memory for function arguments that do not get mutated**
   When a function with a `memory` array is called externally, the `abi.decode()` step has to use a for-loop to copy each index of the `calldata` to the `memory` index. Each iteration of this for-loop costs at least 60 gas (i.e. `60 * <mem_array>.length`). Using `calldata` directly bypasses this loop. 
   
   If the array is passed to an `internal` function which passes the array to another internal function where the array is modified and therefore `memory` is used in the `external` call, it's still more gas-efficient to use `calldata` when the `external` function uses modifiers, since the modifiers may prevent the internal functions from being called. Structs have the same overhead as an array of length one. 
   
    *Saves 60 gas per instance*

 - **GAS-12 : For Operations that will not overflow, you could use unchecked**

 - **GAS-13 : Use Custom Errors instead of Revert Strings to save Gas**
   Custom errors are available from solidity version 0.8.4. Custom errors save [**~50 gas**](https://gist.github.com/IllIllI000/ad1bd0d29a0101b25e57c293b4b0c746) each time they're hit by [avoiding having to allocate and store the revert string](https://blog.soliditylang.org/2021/04/21/custom-errors/#errors-in-depth). Not defining the strings also save deployment gas
   
   Additionally, custom errors can be used inside and outside of contracts (including interfaces and libraries).
   
   Source: <https://blog.soliditylang.org/2021/04/21/custom-errors/>:
   
   > Starting from [Solidity v0.8.4](https://github.com/ethereum/solidity/releases/tag/v0.8.4), there is a convenient and gas-efficient way to explain to users why an operation failed through the use of custom errors. Until now, you could already use strings to give more information about failures (e.g., `revert("Insufficient funds.");`), but they are rather expensive, especially when it comes to deploy cost, and it is difficult to use dynamic information in them.
   
   Consider replacing **all revert strings** with custom errors in the solution, and particularly those that have multiple occurrences:

 - **GAS-14 : Avoid contract existence checks by using low level calls**
   Prior to 0.8.10 the compiler inserted extra code, including `EXTCODESIZE` (**100 gas**), to check for contract existence for external function calls. In more recent solidity versions, the compiler will not insert these checks if the external call has a return value. Similar behavior can be achieved in earlier versions by using low-level calls, since low level calls never check for contract existence

 - **GAS-15 : Stack variable used as a cheaper cache for a state variable is only used once**
   If the variable is only accessed once, it's cheaper to use the state variable directly that one time, and save the **3 gas** the extra stack assignment would spend

 - **GAS-16 : State variables only set in the constructor should be declared `immutable`**
   Variables only set in the constructor and never edited afterwards should be marked as immutable, as it would avoid the expensive storage-writing operation in the constructor (around **20 000 gas** per variable) and replace the expensive storage-reading operations (around **2100 gas** per reading) to a less expensive value reading (**3 gas**)

 - **GAS-17 : Don't initialize variables with default value**
   This is only valid for state variables, as memory ones will be taken care of by the compiler.
   
   If a state variable is not set/initialized, it is assumed to have the default value (`0` for `uint`, `false` for `bool`, `address(0)` for address...). Explicitly initializing it with its default value is an anti-pattern and wastes gas (around **3 gas** per instance).
   
   Consider removing explicit initializations for default values.
   
   *Saves 5000 gas per instance*

 - **GAS-18 : Reduce the size of error messages (Long revert Strings)**
   Shortening revert strings to fit in 32 bytes will decrease deployment time gas and will decrease runtime gas when the revert condition is met.
   
   Revert strings that are longer than 32 bytes require at least one additional mstore, along with additional overhead for computing memory offset, etc.
   
   Consider shortening the revert strings to fit in 32 bytes.
   
   *Saves around 18 gas per instance*

 - **GAS-19 : Functions guaranteed to revert when called by normal users can be marked `payable`**
   If a function modifier such as `onlyOwner` is used, the function will revert if a normal user tries to pay the function. Marking the function as `payable` will lower the gas cost for legitimate callers because the compiler will not include checks for whether a payment was provided.

 - **GAS-20 : `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`)**
   Pre-increments and pre-decrements are cheaper.
   
   For a `uint256 i` variable, the following is true with the Optimizer enabled at 10k:
   
   **Increment:**
   
   - `i += 1` is the most expensive form
   - `i++` costs 6 gas less than `i += 1`
   - `++i` costs 5 gas less than `i++` (11 gas less than `i += 1`)
   
   **Decrement:**
   
   - `i -= 1` is the most expensive form
   - `i--` costs 11 gas less than `i -= 1`
   - `--i` costs 5 gas less than `i--` (16 gas less than `i -= 1`)
   
   Note that post-increments (or post-decrements) return the old value before incrementing or decrementing, hence the name *post-increment*:
   
   ```solidity
   uint i = 1;  
   uint j = 2;
   require(j == i++, "This will be false as i is incremented after the comparison");
   ```
     
   However, pre-increments (or pre-decrements) return the new value:
     
   ```solidity
   uint i = 1;  
   uint j = 2;
   require(j == ++i, "This will be true as i is incremented before the comparison");
   ```
   
   In the pre-increment case, the compiler has to create a temporary variable (when used) for returning `1` instead of `2`.
   
   Consider using pre-increments and pre-decrements where they are relevant (meaning: not where post-increments/decrements logic are relevant).
   
   *Saves 5 gas per instance*

 - **GAS-21 : Using `private` rather than `public` for constants, saves gas**
   If needed, the values can be read from the verified contract source code, or if there are multiple values there can be a single getter function that [returns a tuple](https://github.com/code-423n4/2022-08-frax/blob/90f55a9ce4e25bceed3a74290b854341d8de6afa/src/contracts/FraxlendPair.sol#L156-L178) of the values of all currently-public constants. Saves **3406-3606 gas** in deployment gas due to the compiler not having to create non-payable getter functions for deployment calldata, not having to store the bytes of the value outside of where it's used, and not adding another entry to the method ID table

 - **GAS-22 : Use shift right/left instead of division/multiplication if possible**
   While the `DIV` / `MUL` opcode uses 5 gas, the `SHR` / `SHL` opcode only uses 3 gas. Furthermore, beware that Solidity's division operation also includes a division-by-0 prevention which is bypassed using shifting. Eventually, overflow checks are never performed for shift operations as they are done for arithmetic operations. Instead, the result is always truncated, so the calculation can be unchecked in Solidity version `0.8+`
   - Use `>> 1` instead of `/ 2`
   - Use `>> 2` instead of `/ 4`
   - Use `<< 3` instead of `* 8`
   - ...
   - Use `>> 5` instead of `/ 2^5 == / 32`
   - Use `<< 6` instead of `* 2^6 == * 64`
   
   TL;DR:
   - Shifting left by N is like multiplying by 2^N (Each bits to the left is an increased power of 2)
   - Shifting right by N is like dividing by 2^N (Each bits to the right is a decreased power of 2)
   
   *Saves around 2 gas + 20 for unchecked per instance*

 - **GAS-23 : Incrementing with a smaller type than `uint256` incurs overhead**

 - **GAS-24 : Splitting require() statements that use && saves gas**

 - **GAS-25 : Use `storage` instead of `memory` for structs/arrays**
   Using `memory` copies the struct or array in memory. Use `storage` to save the location in storage and have cheaper reads:

 - **GAS-26 : Superfluous event fields**
   `block.timestamp` and `block.number` are added to event information by default so adding them manually wastes gas

 - **GAS-27 : Use of `this` instead of marking as `public` an `external` function**
   Using `this.` is like making an expensive external call. Consider marking the called function as public
   
   *Saves around 2000 gas per instance*

 - **GAS-28 : `uint256` to `bool` `mapping`: Utilizing Bitmaps to dramatically save on Gas**
   https://soliditydeveloper.com/bitmaps
   
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/BitMaps.sol
   
   - [BitMaps.sol#L5-L16](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/BitMaps.sol#L5-L16):
   
   ```solidity
   /**
    * @dev Library for managing uint256 to bool mapping in a compact and efficient way, provided the keys are sequential.
    * Largely inspired by Uniswap's https://github.com/Uniswap/merkle-distributor/blob/master/contracts/MerkleDistributor.sol[merkle-distributor].
    *
    * BitMaps pack 256 booleans across each bit of a single 256-bit slot of `uint256` type.
    * Hence booleans corresponding to 256 _sequential_ indices would only consume a single slot,
    * unlike the regular `bool` which would consume an entire slot for a single value.
    *
    * This results in gas savings in two ways:
    *
    * - Setting a zero value to non-zero only once every 256 times
    * - Accessing the same warm slot for every 256 _sequential_ indices
    */
   ```

 - **GAS-29 : Increments can be `unchecked` in for-loops**

 - **GAS-30 : Increments/decrements can be unchecked in for-loops**
   In Solidity 0.8+, there's a default overflow check on unsigned integers. It's possible to uncheck this in for-loops and save some gas at each iteration, but at the cost of some code readability, as this uncheck cannot be made inline.
   
   [ethereum/solidity#10695](https://github.com/ethereum/solidity/issues/10695)
   
   The change would be:
   
   ```diff
   - for (uint256 i; i < numIterations; i++) {
   + for (uint256 i; i < numIterations;) {
    // ...  
   +   unchecked { ++i; }
   }  
   ```
   
   These save around **25 gas saved** per instance.
   
   The same can be applied with decrements (which should use `break` when `i == 0`).
   
   The risk of overflow is non-existent for `uint256`.

 - **GAS-31 : Use != 0 instead of > 0 for unsigned integer comparison**

 - **GAS-32 : `internal` functions not called by the contract should be removed**
   If the functions are required by an interface, the contract should inherit from that interface and use the `override` keyword

 - **GAS-33 : WETH address definition can be use directly**
   WETH is a wrap Ether contract with a specific address in the Ethereum network, giving the option to define it may cause false recognition, it is healthier to define it directly.
   
       Advantages of defining a specific contract directly:
       
       It saves gas,
       Prevents incorrect argument definition,
       Prevents execution on a different chain and re-signature issues,
       WETH Address : 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

 - **NC-1 : Replace `abi.encodeWithSignature` and `abi.encodeWithSelector` with `abi.encodeCall` which keeps the code typo/type safe**
   When using `abi.encodeWithSignature`, it is possible to include a typo for the correct function signature.
   When using `abi.encodeWithSignature` or `abi.encodeWithSelector`, it is also possible to provide parameters that are not of the correct type for the function.
   
   To avoid these pitfalls, it would be best to use [`abi.encodeCall`](https://solidity-by-example.org/abi-encode/) instead.

 - **NC-2 : abicoder v2 is enabled by default**
   abicoder v2 is considered non-experimental as of Solidity 0.6.0 and it is enabled by default starting with Solidity 0.8.0. Therefore, there is no need to write.

 - **NC-3 : Missing checks for `address(0)` when assigning values to address state variables**

 - **NC-4 : Array indices should be referenced via `enum`s rather than via numeric literals**

 - **NC-5 : `require()` should be used instead of `assert()`**
   Prior to solidity version 0.8.0, hitting an assert consumes the **remainder of the transaction's available gas** rather than returning it, as `require()`/`revert()` do. `assert()` should be avoided even past solidity version 0.8.0 as its [documentation](https://docs.soliditylang.org/en/v0.8.14/control-structures.html#panic-via-assert-and-error-via-require) states that "The assert function creates an error of type Panic(uint256). ... Properly functioning code should never create a Panic, not even on invalid external input. If this happens, then there is a bug in your contract which you should fix. Additionally, a require statement (or a custom error) are more friendly in terms of understanding what happened."

 - **NC-6 : Use `string.concat()` or `bytes.concat()` instead of `abi.encodePacked`**
   Solidity version 0.8.4 introduces `bytes.concat()` (vs `abi.encodePacked(<bytes>,<bytes>)`)
   
   Solidity version 0.8.12 introduces `string.concat()` (vs `abi.encodePacked(<str>,<str>), which catches concatenation errors (in the event of a `bytes` data mixed in the concatenation)`)

 - **NC-7 : Constants should be in CONSTANT_CASE**
   For `constant` variable names, each word should use all capital letters, with underscores separating each word (CONSTANT_CASE)

 - **NC-8 : `constant`s should be defined rather than using magic numbers**
   Even [assembly](https://github.com/code-423n4/2022-05-opensea-seaport/blob/9d7ce4d08bf3c3010304a0476a785c70c0e90ae7/contracts/lib/TokenTransferrer.sol#L35-L39) can benefit from using readable constants instead of hex/numeric literals

 - **NC-9 : Control structures do not follow the Solidity Style Guide**
   See the [control structures](https://docs.soliditylang.org/en/latest/style-guide.html#control-structures) section of the Solidity Style Guide

 - **NC-10 : Critical Changes Should Use Two-step Procedure**
   The critical procedures should be two step process.
   
   See similar findings in previous Code4rena contests for reference: <https://code4rena.com/reports/2022-06-illuminate/#2-critical-changes-should-use-two-step-procedure>
   
   **Recommended Mitigation Steps**
   
   Lack of two-step procedure for critical operations leaves them error-prone. Consider adding two step procedure on the critical functions.

 - **NC-11 : Dangerous `while(true)` loop**
   Consider using for-loops to avoid all risks of an infinite-loop situation

 - **NC-12 : Default Visibility for constants**
   Some constants are using the default visibility. For readability, consider explicitly declaring them as `internal`.

 - **NC-13 : Delete rogue `console.log` imports**
   These shouldn't be deployed in production

 - **NC-14 : Consider disabling `renounceOwnership()`**
   If the plan for your project does not include eventually giving up all ownership control, consider overwriting OpenZeppelin's `Ownable`'s `renounceOwnership()` function in order to disable it.

 - **NC-15 : Draft Dependencies**
   Draft contracts have not received adequate security auditing or are liable to change with future developments.

 - **NC-16 : Duplicated `require()`/`revert()` Checks Should Be Refactored To A Modifier Or Function**

 - **NC-17 : `else`-block not required**
   One level of nesting can be removed by not having an else block when the if-block returns

 - **NC-18 : Unused `error` definition**
   Note that there may be cases where an error superficially appears to be used, but this is only because there are multiple definitions of the error in different files. In such cases, the error definition should be moved into a separate file. The instances below are the unused definitions.

 - **NC-19 : Event is never emitted**
   The following are defined but never emitted. They can be removed to make the code cleaner.

 - **NC-20 : Events should use parameters to convey information**
   For example, rather than using `event Paused()` and `event Unpaused()`, use `event PauseState(address indexed whoChangedIt, bool wasPaused, bool isNowPaused)`

 - **NC-21 : Event missing indexed field**
   Index event fields make the field more quickly accessible [to off-chain tools](https://ethereum.stackexchange.com/questions/40396/can-somebody-please-explain-the-concept-of-event-indexing) that parse events. This is especially useful when it comes to filtering based on an address. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Where applicable, each `event` should use three `indexed` fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three applicable fields, all of the applicable fields should be indexed.

 - **NC-22 : Events that mark critical parameter changes should contain both the old and the new value**
   This should especially be done if the new value is not required to be different from the old value

 - **NC-23 : Function ordering does not follow the Solidity style guide**
   According to the [Solidity style guide](https://docs.soliditylang.org/en/v0.8.17/style-guide.html#order-of-functions), functions should be laid out in the following order :`constructor()`, `receive()`, `fallback()`, `external`, `public`, `internal`, `private`, but the cases below do not follow this pattern

 - **NC-24 : Functions should not be longer than 50 lines**
   Overly complex code can make understanding functionality more difficult, try to further modularize your code to ensure readability 

 - **NC-25 : Change int to int256**
   Throughout the code base, some variables are declared as `int`. To favor explicitness, consider changing all instances of `int` to `int256`

 - **NC-26 : Change uint to uint256**
   Throughout the code base, some variables are declared as `uint`. To favor explicitness, consider changing all instances of `uint` to `uint256`

 - **NC-27 : Interfaces should be indicated with an `I` prefix in the contract name**

 - **NC-28 : Interfaces should be defined in separate files from their usage**
   The interfaces below should be defined in separate files, so that it's easier for future projects to import them, and to avoid duplication later on if they need to be used elsewhere in the project

 - **NC-29 : Lack of checks in setters**
   Be it sanity checks (like checks against `0`-values) or initial setting checks: it's best for Setter functions to have them

 - **NC-30 : Lines are too long**
   The solidity style guide recommends a maximumum line length of [120 characters](https://docs.soliditylang.org/en/v0.8.17/style-guide.html#maximum-line-length)

 - **NC-31 : Lines are too long**
   Usually lines in source code are limited to [80](https://softwareengineering.stackexchange.com/questions/148677/why-is-80-characters-the-standard-limit-for-code-width) characters. Today's screens are much larger so it's reasonable to stretch this in some cases. Since the files will most likely reside in GitHub, and GitHub starts using a scroll bar in all cases when the length is over [164](https://github.com/aizatto/character-length) characters, the lines below should be split when they reach that length

 - **NC-32 : `mapping` definitions do not follow the Solidity Style Guide**
   See the [mappings](https://docs.soliditylang.org/en/latest/style-guide.html#mappings) section of the Solidity Style Guide

 - **NC-33 : `type(uint<n>).max` should be used instead of `uint<n>(-1)`**

 - **NC-34 : `type(uint256).max` should be used instead of `2 ** 256 - 1`**

 - **NC-35 : Missing Event for critical parameters change**
   Events help non-contract tools to track changes, and events prevent users from being surprised by changes.

 - **NC-36 : NatSpec is completely non-existent on functions that should have them**
   Public and external functions that aren't view or pure should have NatSpec comments

 - **NC-37 : Incomplete NatSpec: `@param` is missing on actually documented functions**
   The following functions are missing `@param` NatSpec comments.

 - **NC-38 : Incomplete NatSpec: `@return` is missing on actually documented functions**
   The following functions are missing `@return` NatSpec comments.

 - **NC-39 : File's first line is not an SPDX Identifier**

 - **NC-40 : Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor**
   If a function is supposed to be access-controlled, a `modifier` should be used instead of a `require/if` statement for more readability.

 - **NC-41 : Constant state variables defined more than once**
   Rather than redefining state variable constant, consider using a library to store all constants as this will prevent data redundancy

 - **NC-42 : Consider using named mappings**
   Consider moving to solidity version 0.8.18 or later, and using [named mappings](https://ethereum.stackexchange.com/questions/51629/how-to-name-the-arguments-in-mapping/145555#145555) to make it easier to understand the purpose of each mapping

 - **NC-43 : `address`s shouldn't be hard-coded**
   It is often better to declare `address`es as `immutable`, and assign them via constructor arguments. This allows the code to remain the same across deployments on different networks, and avoids recompilation when addresses need to change.

 - **NC-44 : The `nonReentrant` `modifier` should occur before all other modifiers**
   This is a best-practice to protect against reentrancy in other modifiers

 - **NC-45 : Numeric values having to do with time should use time units for readability**
   There are [units](https://docs.soliditylang.org/en/latest/units-and-global-variables.html#time-units) for seconds, minutes, hours, days, and weeks, and since they're defined, they should be used

 - **NC-46 : Variable names that consist of all capital letters should be reserved for `constant`/`immutable` variables**
   If the variable needs to be different based on which class it comes from, a `view`/`pure` *function* should be used instead (e.g. like [this](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/76eee35971c2541585e05cbf258510dda7b2fbc6/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#L59)).

 - **NC-47 : Owner can renounce while system is paused**
   The contract owner or single user with a role is not prevented from renouncing the role/ownership while the contract is paused, which would cause any user assets stored in the protocol, to be locked indefinitely.

 - **NC-48 : Adding a `return` statement when the function defines a named return variable, is redundant**

 - **NC-49 : `require()` / `revert()` statements should have descriptive reason strings**

 - **NC-50 : Take advantage of Custom Error's return value property**
   An important feature of Custom Error is that values such as address, tokenID, msg.value can be written inside the () sign, this kind of approach provides a serious advantage in debugging and examining the revert details of dapps such as tenderly.

 - **NC-51 : Deprecated library used for Solidity `>= 0.8` : SafeMath**

 - **NC-52 : Use scientific notation (e.g. `1e18`) rather than exponentiation (e.g. `10**18`)**
   While this won't save gas in the recent solidity versions, this is shorter and more readable (this is especially true in calculations).

 - **NC-53 : Use scientific notation for readability reasons for large multiples of ten**
   The more a number has zeros, the harder it becomes to see with the eyes if it's the intended value. To ease auditing and bug bounty hunting, consider using the scientific notation

 - **NC-54 : Avoid the use of sensitive terms**
   Use [alternative variants](https://www.zdnet.com/article/mysql-drops-master-slave-and-blacklist-whitelist-terminology/), e.g. allowlist/denylist instead of whitelist/blacklist

 - **NC-55 : Strings should use double quotes rather than single quotes**
   See the Solidity Style Guide: https://docs.soliditylang.org/en/v0.8.20/style-guide.html#other-recommendations

 - **NC-56 : Function writing that does not comply with the Solidity Style Guide**
   Order of Functions; ordering helps readers identify which functions they can call and to find the constructor and fallback definitions easier. But there are contracts in the project that do not comply with this.
   
   <https://docs.soliditylang.org/en/v0.8.17/style-guide.html>
   
   Functions should be grouped according to their visibility and ordered:
   
   - constructor
   - receive function (if exists)
   - fallback function (if exists)
   - external
   - public
   - internal
   - private
   - within a grouping, place the view and pure functions last

 - **NC-57 : Contract does not follow the Solidity style guide's suggested layout ordering**
   The [style guide](https://docs.soliditylang.org/en/v0.8.16/style-guide.html#order-of-layout) says that, within a contract, the ordering should be:
   
   1) Type declarations
   2) State variables
   3) Events
   4) Modifiers
   5) Functions
   
   However, the contract(s) below do not follow this ordering

 - **NC-58 : TODO Left in the code**
   TODOs may signal that a feature is missing or not ready for audit, consider resolving the issue and removing the TODO comment

 - **NC-59 : Some require descriptions are not clear**
   1. It does not comply with the general require error description model of the project (Either all of them should be debugged in this way, or all of them should be explained with a string not exceeding 32 bytes.)
   2. For debug dapps like Tenderly, these debug messages are important, this allows the user to see the reasons for revert practically.

 - **NC-60 : Use Underscores for Number Literals (add an underscore every 3 digits)**

 - **NC-61 : Internal and private variables and functions names should begin with an underscore**
   According to the Solidity Style Guide, Non-`external` variable and function names should begin with an [underscore](https://docs.soliditylang.org/en/latest/style-guide.html#underscore-prefix-for-non-external-functions-and-variables)

 - **NC-62 : Event is missing `indexed` fields**
   Index event fields make the field more quickly accessible to off-chain tools that parse events. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Each event should use three indexed fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three fields, all of the fields should be indexed.

 - **NC-63 : Constants should be defined rather than using magic numbers**

 - **NC-64 : `public` functions not called by the contract should be declared `external` instead**

 - **NC-65 : Variables need not be initialized to zero**
   The default value for variables is zero, so initializing them to zero is superfluous.

 - **NC-66 : No need to check that `v == 27` or `v == 28` with `ecrecover`**
   This [Tweeter thread from Alex Beregszaszi aka Axic](https://twitter.com/alexberegszaszi/status/1534461421454606336?s=20&t=H0Dv3ZT2bicx00hLWJk7Fg) explains it well and the [Yellow Paper has been changed](https://pbs.twimg.com/media/FUu--C-XEAELc2A?format=jpg&name=large) in direct consequence to it.
   
   > The Yellow Paper makes it look like nothing is checked.
   
   > Digging into the clients, it turns out the precompile actually checks if the value is 27 or 28. No need to do this on the caller side!
   
   > The change has been merged into the Yellow Paper
