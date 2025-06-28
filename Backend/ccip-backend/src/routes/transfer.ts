import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { executeTransfer } from '../services/ccipService';
import { ChainId } from '../config/ccipConfig';

const router = Router();

// Validate transfer request
const transferValidation = [
  body('sourceChain').isString().notEmpty().withMessage('Source chain is required'),
  body('destinationChain').isString().notEmpty().withMessage('Destination chain is required'),
  body('receiver').isString().notEmpty().withMessage('Receiver address is required'),
  body('amount').isString().notEmpty().withMessage('Amount is required'),
  body('asset').isString().notEmpty().withMessage('Asset is required'),
  body('feeToken').optional().isString()
];

// Execute CCIP transfer
router.post('/', transferValidation, async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { sourceChain, destinationChain, receiver, amount, asset, feeToken } = req.body;

    // Execute transfer
    const result = await executeTransfer({
      sourceChain: sourceChain as ChainId,
      destinationChain: destinationChain as ChainId,
      receiver,
      amount,
      asset,
      feeToken
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error executing transfer:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during transfer'
    });
  }
});

// Get transfer status
router.get('/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    
    // TODO: Implement transfer status check
    // This would query the blockchain for the status of a CCIP message
    
    return res.status(200).json({
      success: true,
      status: 'processing',
      message: 'Transfer status check not yet implemented'
    });
  } catch (error) {
    console.error('Error checking transfer status:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking transfer status'
    });
  }
});

export const transferRoutes = router;